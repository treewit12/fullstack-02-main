const axios = require('axios');
const API = 'http://localhost:3000';
function configWithCookies(req) {
  return { headers: { cookie: req.headers.cookie || '' }, withCredentials: true };
}

exports.getDashboard = async (req, res) => {
  try {
    const resp = await axios.get(`${API}/dashboard`, configWithCookies(req));
    const data = resp.data;
    res.render('dashboard', data);
  } catch (error) {
    console.error(error);
    console.log(error);
    
    res.send('Error loading dashboard');
  }
};