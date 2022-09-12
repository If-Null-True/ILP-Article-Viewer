import mongo from 'mongodb'

const uri = "mongodb://localhost:27017";
const client = new mongo.MongoClient(uri);

try {
    console.log('Connecting to DB...')
    // Connect to the MongoDB cluster
    await client.connect();

    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");

    // Make the appropriate DB calls
    var database = client.db("ilp")
    var users = database.collection("users")
    var articles = database.collection("articles")

} catch (e) {
    console.error(e);
    client.close()
}

process.on('SIGINT', function () {
    client.close();
    console.log("Disconnected From DB.");
    process.exit();
});

export { users, articles }