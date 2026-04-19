const { fetchOSINT } = require("../services/osint.service");

const getOSINT = async (req, res) => {
  try {
    const data = await fetchOSINT();
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

module.exports = { getOSINT };
