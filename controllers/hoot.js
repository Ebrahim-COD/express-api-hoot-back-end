const express = require("express");
const router = express.Router();
const Hoot = require("../models/hoot");





/////////////////////////////Public Routes/////////////////////////////








/////////////////////////////Protected Routes/////////////////////////////

router.post('/', async (req, res) => {
    try {
      req.body.author = req.user.id;
      const hoot = await Hoot.create(req.body);
      hoot._doc.author = req.user;
      res.status(201).json(hoot);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.get('/', async (req, res) => {
    try {
      const hoots = await Hoot.find({})
        .populate('author')
        .sort({ createdAt: 'desc' });
      res.status(200).json(hoots);
    } catch (error) {
      res.status(500).json(error);
    }
  });

router.get('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate('author');
        res.status(200).json(hoot);
    } catch (error) {
        res.status(500).json(error);
        }
    }
);

router.put('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        //check if the auther of the hoot is same as the user
        if(!hoot.author.equals(req.user.id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updateHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            { new: true }
        );
        
        updateHoot._doc.author = req.user;

        res.status(200).json(updateHoot);

    } catch (error) {
        res.status(500).json(error);
    }
})

router.delete('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);

        if(!hoot.author.equals(req.user.id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);

    } catch (error) {
        res.status(500).json(error);
    }
})

router.post('/:hootId/comments', async (req, res) => {
  try {
    req.body.author = req.user._id;
    const hoot = await Hoot.findById(req.params.hootId);
    hoot.comments.push(req.body);
    await hoot.save();

    // Find the newly created comment:
    const newComment = hoot.comments[hoot.comments.length - 1];

    newComment._doc.author = req.user;

    // Respond with the newComment:
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put('/:hootId/comments/:commentId', async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId);
      const comment = hoot.comments.id(req.params.commentId);
      comment.text = req.body.text;
      await hoot.save();
      res.status(200).json({ message: 'Ok' });
    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.delete('/:hootId/comments/:commentId', async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId);
      hoot.comments.remove({ _id: req.params.commentId });
      await hoot.save();
      res.status(200).json({ message: 'Ok' });
    } catch (err) {
      res.status(500).json(err);
    }
  });


module.exports = router;