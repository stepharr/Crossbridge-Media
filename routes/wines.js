var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('winedb', server, {safe: true});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'winedb' database");
        db.collection('wines', {safe:true}, function(err, collection) {
            if (err) {
                console.log("The 'wines' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('wines', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addWine = function(req, res) {
    var wine = req.body;
    console.log('Adding wine: ' + JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.insert(wine, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

exports.updateWine = function(req, res) {
    var id = req.params.id;
    var wine = req.body;
    delete wine._id;
    console.log('Updating wine: ' + id);
    console.log(JSON.stringify(wine));
    db.collection('wines', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, wine, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating wine: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(wine);
            }
        });
    });
}

exports.deleteWine = function(req, res) {
    var id = req.params.id;
    console.log('Deleting wine: ' + id);
    db.collection('wines', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {
    // {
    //     Title: "The Gospel Accourding to Joshua",
    //     Preacher: "Chuck Land",
    //     Tags: "Grenache / Syrah",
    //     DAte: "France",
    //     region: "",
    //     Notes: "The Gospel Accourding to Joshua.",
    //     picture: "joshua.jpeg"
    // },
    var wines = [
    {
        name: "The Gospel Accourding to Joshua",
        year: "Chuck Land",
        grapes: "Joshua, Old Testament",
        country: "     ",
        region: "http://crossbridge.cc/talks/The%20Gospel%20According%20to%20Joshua/Joshua%206.mp3",
        description: "The  Gospel Accourding to Joshua.",
        picture: "joshua.jpeg"
    },
    {
        name: "Renew",
        year: "Chuck Land",
        grapes: "Renew, Revived",
        country: "     ",
        region: "http://crossbridge.cc/talks/Renew/Renew%206.mp3",
        description: "Good Fresh Start.",
        picture: "Renew.jpeg"
    },
    {
        name: "Abide",
        year: "Chuck Land",
        grapes: "Truth, John 15",
        country: "      ",
        region: "http://crossbridge.cc/talks/Abide/Abide.mp3",
        description: "Abide in Him.",
        picture: "abide.jpeg"
    }];

    db.collection('wines', function(err, collection) {
        collection.insert(wines, {safe:true}, function(err, result) {});
    });

};