const distance = (lat1, lon1, lat2, lon2) => {
  var piValue = 0.017453292519943295; // Math.PI / 180
  var cosine = Math.cos;
  var cosineDistance = 0.5 - cosine((lat2 - lat1) * piValue)/2 + 
          cosine(lat1 * piValue) * cosine(lat2 * piValue) * 
          (1 - cosine((lon2 - lon1) * piValue))/2;

  return 12742 * Math.asin(Math.sqrt(cosineDistance)); // 2 * R; R = 6371 km
}

module.exports = {distance};
