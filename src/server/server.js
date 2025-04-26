const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
// Increase payload size limit to 100MB to handle image data
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// File paths
const categoriesFile = path.join(__dirname, "categories.json");
const recipesFile = path.join(__dirname, "recipes.json");
const commentsFile = path.join(__dirname, "comments.json");
const likesFile = path.join(__dirname, "likes.json");
const followsFile = path.join(__dirname, "follows.json");
const usersFile = path.join(__dirname, "users.json");

// Helper functions to read/write JSON files
const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist, return empty array
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};

const writeFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Categories Endpoints

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   category:
 *                     type: string
 *       500:
 *         description: Failed to read categories
 */
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to read categories" });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: Name of the category
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 category:
 *                   type: string
 *       500:
 *         description: Failed to create category
 */
app.post("/api/categories", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    const newCategory = {
      id: categories.length ? categories[categories.length - 1].id + 1 : 1,
      category: req.body.category,
    };
    categories.push(newCategory);
    await writeFile(categoriesFile, categories);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Failed to create category" });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: Updated name of the category
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 category:
 *                   type: string
 *       404:
 *         description: Category not found
 *       500:
 *         description: Failed to update category
 */
app.put("/api/categories/:id", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    const id = parseInt(req.params.id);
    const index = categories.findIndex((cat) => cat.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Category not found" });
    }
    categories[index] = { id, category: req.body.category };
    await writeFile(categoriesFile, categories);
    res.json(categories[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update category" });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to delete category
 */
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const categories = await readFile(categoriesFile);
    const id = parseInt(req.params.id);
    const updatedCategories = categories.filter((cat) => cat.id !== id);
    await writeFile(categoriesFile, updatedCategories);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Recipes Endpoints

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of all recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   author:
 *                     type: string
 *                   category:
 *                     type: string
 *                   image:
 *                     type: string
 *                   ingredients:
 *                     type: array
 *                     items:
 *                       type: string
 *                   instruction:
 *                     type: string
 *                   name:
 *                     type: string
 *       500:
 *         description: Failed to read recipes
 */
app.get("/api/recipes", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to read recipes" });
  }
});

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instruction:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 author:
 *                   type: string
 *                 category:
 *                   type: string
 *                 image:
 *                   type: string
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: string
 *                 instruction:
 *                   type: string
 *                 name:
 *                   type: string
 *       500:
 *         description: Failed to create recipe
 */
app.post("/api/recipes", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const newRecipe = {
      id: recipes.length ? recipes[recipes.length - 1].id + 1 : 1,
      author: req.body.author,
      category: req.body.category,
      image: req.body.image,
      ingredients: req.body.ingredients,
      instruction: req.body.instruction,
      name: req.body.name,
    };
    recipes.push(newRecipe);
    await writeFile(recipesFile, recipes);
    
    console.log("[✅ Recipe Created]", newRecipe); // Success log
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error("[❌ Failed to Create Recipe]", err); // Error log
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update a recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               image:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instruction:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 author:
 *                   type: string
 *                 category:
 *                   type: string
 *                 image:
 *                   type: string
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: string
 *                 instruction:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Failed to update recipe
 */
app.put("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const id = parseInt(req.params.id);
    const index = recipes.findIndex((recipe) => recipe.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    recipes[index] = { id, ...req.body };
    await writeFile(recipesFile, recipes);
    res.json(recipes[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *S       500:
 *         description: Failed to delete recipe
 */
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const id = parseInt(req.params.id);
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== id);
    await writeFile(recipesFile, updatedRecipes);
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

// Comments Endpoints

/**
 * @swagger
 * /api/comments/{recipeId}:
 *   get:
 *     summary: Get comments for a specific recipe
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: List of comments for the recipe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   recipeId:
 *                     type: string
 *                   authorId:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Failed to read comments
 */
app.get("/api/comments/:recipeId", async (req, res) => {
  try {
    const comments = await readFile(commentsFile);
    const recipeComments = comments.filter(
      (comment) => comment.recipeId === req.params.recipeId
    );
    res.json(recipeComments);
  } catch (err) {
    res.status(500).json({ error: "Failed to read comments" });
  }
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment for a recipe
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: string
 *               authorId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 recipeId:
 *                   type: string
 *                 authorId:
 *                   type: string
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Failed to create comment
 */
app.post("/api/comments", async (req, res) => {
  try {
    const comments = await readFile(commentsFile);
    const newComment = {
      id: `comment_${Date.now()}`,
      recipeId: req.body.recipeId,
      authorId: req.body.authorId,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    await writeFile(commentsFile, comments);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to delete comment
 */
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const comments = await readFile(commentsFile);
    const updatedComments = comments.filter(
      (comment) => comment.id !== req.params.id
    );
    await writeFile(commentsFile, updatedComments);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Likes Endpoints

/**
 * @swagger
 * /api/likes/{recipeId}:
 *   get:
 *     summary: Get likes for a specific recipe
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: List of likes for the recipe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   recipeId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Failed to read likes
 */
app.get("/api/likes/:recipeId", async (req, res) => {
  try {
    const likes = await readFile(likesFile);
    const recipeLikes = likes.filter(
      (like) => like.recipeId === req.params.recipeId
    );
    res.json(recipeLikes);
  } catch (err) {
    res.status(500).json({ error: "Failed to read likes" });
  }
});

/**
 * @swagger
 * /api/likes:
 *   post:
 *     summary: Like a recipe
 *     tags: [Likes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipeId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Like created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 recipeId:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: User already liked this recipe
 *       500:
 *         description: Failed to create like
 */
app.post("/api/likes", async (req, res) => {
  try {
    const likes = await readFile(likesFile);
    // Check if user already liked the recipe
    const existingLike = likes.find(
      (like) => like.recipeId === req.body.recipeId && like.userId === req.body.userId
    );
    if (existingLike) {
      return res.status(400).json({ error: "User already liked this recipe" });
    }
    const newLike = {
      id: `like_${Date.now()}`,
      recipeId: req.body.recipeId,
      userId: req.body.userId,
      createdAt: new Date().toISOString(),
    };
    likes.push(newLike);
    await writeFile(likesFile, likes);
    res.status(201).json(newLike);
  } catch (err) {
    res.status(500).json({ error: "Failed to create like" });
  }
});

/**
 * @swagger
 * /api/likes/{recipeId}/{userId}:
 *   delete:
 *     summary: Unlike a recipe
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Like removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to remove like
 */
app.delete("/api/likes/:recipeId/:userId", async (req, res) => {
  try {
    const likes = await readFile(likesFile);
    const updatedLikes = likes.filter(
      (like) => !(like.recipeId === req.params.recipeId && like.userId === req.params.userId)
    );
    await writeFile(likesFile, updatedLikes);
    res.json({ message: "Like removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove like" });
  }
});

// Follows Endpoints

/**
 * @swagger
 * /api/follows/{userId}:
 *   get:
 *     summary: Get followers and following for a user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Follow relationships for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       followerId:
 *                         type: string
 *                       followingId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       followerId:
 *                         type: string
 *                       followingId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Failed to read follows
 */
app.get("/api/follows/:userId", async (req, res) => {
  try {
    const follows = await readFile(followsFile);
    const userFollows = {
      following: follows.filter((follow) => follow.followerId === req.params.userId),
      followers: follows.filter((follow) => follow.followingId === req.params.userId),
    };
    res.json(userFollows);
  } catch (err) {
    res.status(500).json({ error: "Failed to read follows" });
  }
});

/**
 * @swagger
 * /api/follows:
 *   post:
 *     summary: Follow a user
 *     tags: [Follows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               followerId:
 *                 type: string
 *               followingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Follow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 followerId:
 *                   type: string
 *                 followingId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Already following this user
 *       500:
 *         description: Failed to create follow
 */
app.post("/api/follows", async (req, res) => {
  try {
    const follows = await readFile(followsFile);
    // Check if already following
    const existingFollow = follows.find(
      (follow) => 
        follow.followerId === req.body.followerId && 
        follow.followingId === req.body.followingId
    );
    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }
    const newFollow = {
      id: `follow_${Date.now()}`,
      followerId: req.body.followerId,
      followingId: req.body.followingId,
      createdAt: new Date().toISOString(),
    };
    follows.push(newFollow);
    await writeFile(followsFile, follows);
    res.status(201).json(newFollow);
  } catch (err) {
    res.status(500).json({ error: "Failed to create follow" });
  }
});

/**
 * @swagger
 * /api/follows/{followerId}/{followingId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: followerId
 *         schema:
 *           type: string
 *         required: true
 *         description: The follower ID
 *       - in: path
 *         name: followingId
 *         schema:
 *           type: string
 *         required: true
 *         description: The following ID
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Failed to unfollow
 */
app.delete("/api/follows/:followerId/:followingId", async (req, res) => {
  try {
    const follows = await readFile(followsFile);
    const updatedFollows = follows.filter(
      (follow) => 
        !(follow.followerId === req.params.followerId && 
          follow.followingId === req.params.followingId)
    );
    await writeFile(followsFile, updatedFollows);
    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to unfollow" });
  }
});

// Users Endpoints

/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: Get a user by UID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: The user UID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 photoURL:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to read user
 */
app.get("/api/users/:uid", async (req, res) => {
  try {
    const users = await readFile(usersFile);
    const user = users.find((u) => u.uid === req.params.uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to read user" });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               photoURL:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 photoURL:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: User already exists
 *       500:
 *         description: Failed to create user
 */
app.post("/api/users", async (req, res) => {
  try {
    const users = await readFile(usersFile);
    const existingUser = users.find((u) => u.uid === req.body.uid);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const newUser = {
      uid: req.body.uid,
      displayName: req.body.displayName,
      email: req.body.email,
      photoURL: req.body.photoURL,
      bio: req.body.bio || "",
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeFile(usersFile, users);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     summary: Update a user by UID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: The user UID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               email:
 *                 type: string
 *               photoURL:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                 displayName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 photoURL:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
app.put("/api/users/:uid", async (req, res) => {
  try {
    const users = await readFile(usersFile);
    const index = users.findIndex((u) => u.uid === req.params.uid);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a new user object with updated fields
    const updatedUser = {
      ...users[index],
      displayName: req.body.displayName || users[index].displayName,
      email: req.body.email || users[index].email,
      photoURL: req.body.photoURL, // Use the new photoURL directly
      bio: req.body.bio || users[index].bio,
      uid: users[index].uid, // Prevent uid from being changed
      kitchenFriends: users[index].kitchenFriends,
      followers: users[index].followers
    };

    users[index] = updatedUser;
    await writeFile(usersFile, users);
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Search Endpoint

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search recipes by query
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query (e.g., recipe name, category, ingredients)
 *     responses:
 *       200:
 *         description: List of matching recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   author:
 *                     type: string
 *                   category:
 *                     type: string
 *                   image:
 *                     type: string
 *                   ingredients:
 *                     type: array
 *                     items:
 *                       type: string
 *                   instruction:
 *                     type: string
 *                   name:
 *                     type: string
 *       500:
 *         description: Failed to search recipes
 */
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Received search query:', query);

    if (!query) {
      return res.json([]);
    }

    const recipes = await readFile(recipesFile);
    console.log('Total recipes loaded:', recipes.length);

    // Normalize search terms: trim, remove extra spaces, lowercase
    const searchTerms = query.toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0);

    console.log('Search terms:', searchTerms);
    
    const results = recipes.filter(recipe => {
      // Create searchable text with all recipe fields
      const searchableText = [
        recipe.name,
        recipe.author,
        recipe.category,
        ...(recipe.ingredients || []),
        recipe.instruction
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      // For exact matches (e.g., full recipe name)
      if (searchableText.includes(query.toLowerCase())) {
        return true;
      }

      // For partial matches (individual terms)
      return searchTerms.every(term => searchableText.includes(term));
    });

    console.log(`Found ${results.length} matches for "${query}"`);
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: "Failed to search recipes" });
  }
});

// Suggestions Endpoint

/**
 * @swagger
 * /api/suggestions:
 *   get:
 *     summary: Get recipe suggestions based on query
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: false
 *         description: Search query for suggestions (optional)
 *     responses:
 *       200:
 *         description: List of suggested recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *       500:
 *         description: Failed to get suggestions
 */
app.get("/api/suggestions", async (req, res) => {
  try {
    const { query } = req.query;
    console.log('Received suggestion query:', query);

    const recipes = await readFile(recipesFile);

    if (!query) {
      const suggestions = recipes.slice(0, 4).map(r => ({
        id: r.id,
        name: r.name,
        category: r.category
      }));
      return res.json(suggestions);
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    const suggestions = recipes
      .filter(recipe => {
        // Check for matches in name (prioritize)
        if (recipe.name.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        
        // Check category
        if (recipe.category.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        
        // Check ingredients
        if (recipe.ingredients.some(ing => 
          ing.toLowerCase().includes(normalizedQuery)
        )) {
          return true;
        }

        // Check instruction
        if (recipe.instruction.toLowerCase().includes(normalizedQuery)) {
          return true;
        }

        return false;
      })
      .slice(0, 4)
      .map(r => ({
        id: r.id,
        name: r.name,
        category: r.category
      }));

    console.log(`Found ${suggestions.length} suggestions for "${query}"`);
    res.json(suggestions);
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get a specific recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Recipe details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 author:
 *                   type: string
 *                 category:
 *                   type: string
 *                 image:
 *                   type: string
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: string
 *                 instruction:
 *                   type: string
 *                 name:
 *                   type: string
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       recipeId:
 *                         type: string
 *                       authorId:
 *                         type: string
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 likes:
 *                   type: integer
 *                 isLiked:
 *                   type: boolean
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Failed to fetch recipe
 */
app.get("/api/recipes/:id", async (req, res) => {
  try {
    const recipes = await readFile(recipesFile);
    const id = parseInt(req.params.id);
    const recipe = recipes.find((recipe) => recipe.id === id);
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Get additional data for the recipe
    const [comments, likes] = await Promise.all([
      readFile(commentsFile),
      readFile(likesFile)
    ]);

    // Get comments for this recipe
    const recipeComments = comments.filter(
      (comment) => comment.recipeId === id.toString()
    );

    // Get likes count for this recipe
    const recipeLikes = likes.filter(
      (like) => like.recipeId === id.toString()
    );

    // Combine all data
    const recipeWithDetails = {
      ...recipe,
      comments: recipeComments,
      likes: recipeLikes.length,
      isLiked: false // Default value, should be updated based on user auth
    };

    res.json(recipeWithDetails);
  } catch (err) {
    console.error("[❌ Failed to fetch recipe]", err);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cooking App API',
      version: '1.0.0',
      description: 'API documentation for Cooking App',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  // Update the path to point to server.js (relative to the server directory)
  apis: ['./server.js'], // Since server.js is in the server directory
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});