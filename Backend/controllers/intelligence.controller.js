const intelligenceService = require("../services/intelligence.service");

class IntelligenceController {
  async getData(req, res) {
    try {
      const { type, search, date } = req.query;
      const data = await intelligenceService.getIntelligenceData(type, search, date);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching intelligence data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async uploadHumint(req, res) {
    try {
      const file = req.file || (req.files && req.files[0]);
      if (!file) {
        return res.status(400).json({ error: "No CSV file uploaded" });
      }
      
      const result = await intelligenceService.processHumintCSV(file.path);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error processing HUMINT CSV:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async uploadImint(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const doc = await intelligenceService.processImintUpload(req.file, req.body);
      res.status(201).json(doc);
    } catch (error) {
      console.error("Error processing IMINT upload:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new IntelligenceController();
