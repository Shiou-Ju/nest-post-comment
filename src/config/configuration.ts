export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: parseInt(process.env.MONGO_URI, 10) || 27017,
});
