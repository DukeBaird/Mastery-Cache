
import express from 'express';
import Promise from 'bluebird';

let router = express.Router();

function checkSummoner(req, res, next) {
	res.status(200).json({
		champs: [1,2,3]
	});
}
router.get('/topMastery', checkSummoner);

exports.router = router;
