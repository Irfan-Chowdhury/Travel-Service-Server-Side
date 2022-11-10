const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uys3vh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message:'Unauthorized Access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if (err) {
            res.status(403).send({message:'Forbidden Access'});
        }
        req.decoded = decoded;
        next();
    });
    // console.log(req.headers.authorization);
}

async function run(){
    try {
        const serviceCollection  = client.db('serviceReview').collection('services');
        const reviewCollection  = client.db('serviceReview').collection('reviews');

        // JWT
        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
            res.send({token});
        })

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
            // const decoded = req.decoded;
            // console.log('inside reviews API',decoded);
            // if (decoded.email !== req.query.email) {
            //     res.status(403).send({message:'Unauthorized Access'});
            // }

            const query = {};
            const cursor = reviewCollection.find(query).sort({"_id":-1});
            const reviews  = await cursor.toArray();
            res.send(reviews);
        });

        // Get Reviews By ServiceId
        app.get('/reviews/:serviceId',verifyJWT, async (req, res) => {
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

        // Update
        app.put('/review/:id', async (req, res) => {
            const id =  req.params.id;
            const filter = {_id: ObjectId(id)};
            const customerReview = req.body;
            const option = {upsert:true};
            const updateUser = {
                $set : {
                    review: customerReview.review,
                }
            }
            const result = await reviewCollection.updateOne(filter, updateUser,option);
            
            const singleReview = await reviewCollection.findOne(filter);
            res.send(singleReview);
        })

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