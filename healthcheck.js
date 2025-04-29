const axios = require('axios');

axios.get('http://localhost:4000/health')
  .then(response => {
    if (response.status === 200) process.exit(0);
    else process.exit(1);
  })
  .catch(() => process.exit(1));