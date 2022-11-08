const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uys3vh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        const serviceCollection  = client.db('serviceReview').collection('services');

        // Read
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services  = await cursor.limit(3).toArray();
            res.send(services);
        });
        app.get('/all-service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services  = await cursor.toArray();
            res.send(services);
        });

    } finally {
        
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Project server is running');
});

app.listen(port, () =>{
    console.log('Project Server running on port', port);
});