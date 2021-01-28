const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


// @route GET api/profile/me
// @desc get current users profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/profile
// @desc    create or update a user profile
router.post('/', auth, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        favSubreddits,
        newsletterSendTime,
        wantsNewsletter
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (favSubreddits) {
        profileFields.favSubreddits = favSubreddits.split(',').map(favSubreddits => favSubreddits.trim());
    }
    if (newsletterSendTime) profileFields.newsletterSendTime = newsletterSendTime;
    if (wantsNewsletter) profileFields.wantsNewsletter = wantsNewsletter;


    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            return res.json(profile);
        };

        //create
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch (err) {

        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// @route GET api/profile
// @desc get all profiles
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route GET api/profile/user/:user_id
// @desc get profile by user_id
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name']);

        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
})


// @route GET api/profile/getreddit/:user_id
// get user favorite reddit by their id

router.get('/getreddit/:user_id', (req, res) => {
    try {
        const options = {
            uri: `https://www.reddit.com/r/news/top.json`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                res.status(404).json({ msg: 'no reddit found' });
            }
            res.json(JSON.parse(body));
        })
    } catch (err) {

        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports = router;