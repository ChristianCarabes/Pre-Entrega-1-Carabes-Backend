import express from 'express'
import { __dirname } from './utils.js'

const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

let products = [];
let carts = [];
let productIdCounter = 1;
let cartIdCounter = 1;

const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});

productsRouter.get('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: "Producto no encontrado" });
    }
});

productsRouter.post('/', (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: "Todos los campos son obligatorios excepto thumbnails" });
    }
    const newProduct = {
        id: productIdCounter++,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    const { id, ...updatedFields } = req.body;
    products[productIndex] = { ...products[productIndex], ...updatedFields };
    res.json(products[productIndex]);
});

productsRouter.delete('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    products = products.filter(p => p.id !== productId);
    res.status(204).send();
});

const cartsRouter = express.Router();

cartsRouter.post('/', (req, res) => {
    const newCart = {
        id: cartIdCounter++,
        products: []
    };
    carts.push(newCart);
    res.status(201).json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const cart = carts.find(c => c.id === cartId);
    if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart.products);
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const cart = carts.find(c => c.id === cartId);
    if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }
    
    const productInCart = cart.products.find(p => p.product === productId);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.products.push({ product: productId, quantity: 1 });
    }
    res.json(cart);
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
