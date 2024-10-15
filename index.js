const express = require('express');
const app = express();
const PORT = 3000;
const mongoose = require('./src/db');
const User = require('./src/models/User');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const Post = require('./src/models/Post');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./src/middleware/validateToken');
const dotenv = require('dotenv');

dotenv.config();
app.use(cors()); 
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const postSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    userId: Joi.string().required()
});

app.post('/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).send({
            status: '400',
            message: error.details[0].message.replace(/"/g, '').toUpperCase()
        });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send({
                status: '400',
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).send({
            status: '200',
            message: 'Login successful',
            token: token
        });

    } catch (err) {
        console.error(err);
        res.status(500).send({
            status: '500',
            error: err.message,
            message: 'Error logging in'
        });
    }
});

app.get('/', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().populate('posts');
        res.status(200).send({ users: users });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: '500', message: 'Server error' });
    }
});

app.post('/', authenticateToken,async (req, res) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).send({
            status: '400',
            message: error.details[0].message.replace(/"/g, '').toUpperCase()
        });
    }

    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send({ status: '409', message: 'Email Already Exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });
        
        res.status(201).send({ status: '201', message: 'User created successfully', user: user });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: '500', message: 'Error creating user' });
    }
});

app.get('/posts', authenticateToken,async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).send({ posts: posts });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: '500', message: 'Server error' });
    }
});

app.post('/posts', authenticateToken,async (req, res) => {
    const { error } = postSchema.validate(req.body);
    if (error) {
        return res.status(400).send({
            status: '400',
            message: error.details[0].message.replace(/"/g, '').toUpperCase()
        });
    }

    const { name, userId } = req.body;

    try {
        const post = await Post.create({ name, userId });
        res.status(201).send({ status: '201', message: 'Post created successfully', post });
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: '500', message: 'Error creating post' });
    }
});

app.get('/post/:id', authenticateToken,async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ status: '400', message: 'Invalid Post ID format' });
        }
        const post = await Post.findById(id);
        if (post) {
            res.status(200).send({ status: '200', message: 'Post retrieved successfully', post: post });
        } else {
            res.status(404).send({ status: '404', message: 'Post not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ status: '500', message: 'Error retrieving post' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
