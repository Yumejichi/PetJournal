const un = 'yfujita2'; //Define user name as string
const pw = 'yume1228'; //Define your password here as string
module.exports = {
  mongo: {
    connectionString: `mongodb+srv://${un}:${pw}@fullstackwebdev.lme10tb.mongodb.net/PetJournal?retryWrites=true&w=majority`,
  },
};
