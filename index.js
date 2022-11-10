const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const reviewCollection  = client.db('serviceReview').collection('reviews');

            // =========================  Service ============================

        // Get 3 data Limit
        app.get('/services-limit', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({"_id":-1});
            const services  = await cursor.limit(3).toArray();
            res.send(services);
        });
        //Get All
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({"_id":-1});
            const services  = await cursor.toArray();
            res.send(services);
        });
        // Show By Id
        app.get('/services/:id', async (req, res) => {
            const id =  req.params.id;
            const query = {_id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });
        // Create
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result =  await serviceCollection.insertOne(service);
            res.send(result);
        });



        // =========================  Review ============================
        //Get All
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query).sort({"_id":-1});
            const reviews  = await cursor.toArray();
            res.send(reviews);
        });

        // Get Reviews By ServiceId
        app.get('/reviews/:serviceId', async (req, res) => {
            const serviceId =  req.params.serviceId;
            const query = {service_id: serviceId};
            const cursor = reviewCollection.find(query).sort({"_id":-1})
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Add Post
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result =  await reviewCollection.insertOne(review);
            res.send(result);
        });

        // Delete
        app.delete('/review/:id', async (req, res) => {            
            const id =  req.params.id;
            const query = {_id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
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