const Intelligence = require("../models/Intelligence");
const fs = require("fs");
const csv = require("csv-parser");
const AWS = require("aws-sdk");

// ====================== AWS S3 CONFIG ======================
AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// ====================== AI TAG GENERATOR ======================
const generateTags = (text = "") => {
  const t = text.toLowerCase();
  const tags = [];

  const keywords = {
    vehicle:       ["vehicle", "truck", "convoy", "tank", "armored", "car", "aircraft", "helicopter"],
    crowd:         ["crowd", "gathering", "protest", "assembly", "march", "riot"],
    fire:          ["fire", "explosion", "blast", "smoke", "burning", "detonation"],
    weapon:        ["weapon", "missile", "gun", "armed", "explosive", "artillery", "rocket"],
    infrastructure:["bridge", "road", "facility", "building", "warehouse", "port", "airport"],
    movement:      ["movement", "troop", "personnel", "soldier", "patrol", "advance"],
    surveillance:  ["surveillance", "camera", "signal", "radar", "satellite"],
  };

  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(w => t.includes(w))) tags.push(tag);
  }

  return tags.length > 0 ? tags : ["unclassified"];
};

class IntelligenceService {
  async getIntelligenceData(type, search, date) {
    let filter = {};
    if (type) filter.source = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.timestamp = { $gte: start, $lte: end };
    }
    return await Intelligence.find(filter).sort({ timestamp: -1 });
  }

  async processHumintCSV(filePath) {
    return new Promise((resolve, reject) => {
      let results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          const title = row.title || row.Title || row.Name;
          const description = row.description || row.Description || row.Briefing;
          const lat = parseFloat(row.lat || row.Lat || row.Latitude);
          const lng = parseFloat(row.lng || row.Lng || row.Longitude);

          if (isNaN(lat) || isNaN(lng)) return;

          results.push({
            source: "HUMINT",
            title: title || "HUMINT Node",
            description: description || "No description provided",
            location: {
              type: "Point",
              coordinates: [lng, lat]
            },
            tags: ["humint"]
          });
        })
        .on("end", async () => {
          try {
            if (results.length > 0) {
              await Intelligence.insertMany(results);
              if (global.io) global.io.emit('intel:update');
            }
            setTimeout(() => {
              if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) {}
              }
            }, 1000);
            resolve({ inserted: results.length });
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async processImintUpload(file, body) {
    try {
      if (!body.lat || !body.lng) {
        throw new Error("Geospatial coordinates (lat/lng) are required for IMINT nodes.");
      }

      const uploadResult = await s3.upload({
        Bucket: process.env.S3_BUCKET,
        Key: `IMINT_${Date.now()}_${file.originalname}`,
        Body: fs.createReadStream(file.path),
        ContentType: file.mimetype
      }).promise();

      const doc = await Intelligence.create({
        source: "IMINT",
        title: body.title || "Untitled IMINT",
        description: body.description || "No description provided.",
        location: {
          type: "Point",
          coordinates: [parseFloat(body.lng), parseFloat(body.lat)]
        },
        mediaUrl: uploadResult.Location,
        tags: generateTags(body.title)
      });

      if (global.io) global.io.emit('intel:update');
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      
      return doc;
    } catch (error) {
      if (file && file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw error;
    }
  }
}

module.exports = new IntelligenceService();
