const axios = require("axios");
const Intelligence = require("../models/Intelligence");

// simple location mapping (demo purpose)
const getCoordinates = (text) => {
  const map = {
    india: [77.209, 28.6139],
    delhi: [77.209, 28.6139],
    mumbai: [72.8777, 19.0760],
    usa: [-95.7129, 37.0902],
    china: [104.1954, 35.8617],
    russia: [37.6173, 55.7558],
    uk: [-0.1276, 51.5074],
    japan: [139.6503, 35.6762]
  };

  const lowerText = text.toLowerCase();
  for (let key in map) {
    if (lowerText.includes(key)) {
      return map[key];
    }
  }

  // If no match, return a slightly randomized coordinate near India for demo consistency
  return [78.9629 + (Math.random() - 0.5) * 5, 20.5937 + (Math.random() - 0.5) * 5];
};

const fetchOSINT = async () => {
  try {
    if (!process.env.NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY not found in environment");
    }

    let res = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=in&apiKey=${process.env.NEWS_API_KEY}`
    );

    let articles = res.data.articles || [];
    
    if (articles.length === 0) {
      res = await axios.get(
        `https://newsapi.org/v2/everything?q=security+defense&language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`
      );
      articles = res.data.articles || [];
    }

    const savedData = [];

    for (let article of articles.slice(0, 10)) {
      const existing = await Intelligence.findOne({ title: article.title });
      if (existing) continue;

      const coords = getCoordinates(
        (article.description || "") + " " + (article.title || "")
      );

      try {
        const intel = await Intelligence.create({
          source: "OSINT",
          title: article.title,
          description: article.description || "Intelligence intercept via News API",
          mediaUrl: article.urlToImage,
          location: {
            type: "Point",
            coordinates: coords
          },
          tags: ["news", "osint"]
        });

        savedData.push(intel);
      } catch (dbErr) {}
    }

    if (savedData.length === 0 && articles.length > 0) {
      return await Intelligence.find({ source: "OSINT" }).sort({ _id: -1 }).limit(10);
    }

    return savedData;
  } catch (err) {
    throw err;
  }
};

module.exports = { fetchOSINT };
