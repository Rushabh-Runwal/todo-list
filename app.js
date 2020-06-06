//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));


//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];
// NOW USING MONGODB
mongoose.connect("mongodb+srv://admin-rushabh:rushabh-22@cluster0-fgh1t.mongodb.net/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemSchema = {
    name: {
        type: String,
        required: [1]
    }
}



const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: "Welcome to your to do list",
});
const item2 = new Item({
    name: "Type and hit '+' to add new item.",
});
const item3 = new Item({
    name: "<== Hit here to delete a item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    item: [itemSchema]
}
const List = mongoose.model('List', listSchema);


app.get("/", function (req, res) {

    //const day = date.getDate();
    Item.find({}, function (err, foundItems) {
        console.log(foundItems);
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items");
                }
            });
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    });

});


app.post("/", function (req, res) {

    const item = req.body.newItem;
    const listName = req.body.list;
    const newItemDoc = new Item({
        name: item
    });

    if (listName === "Today") {
        newItemDoc.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function (err, foundlist) {
            foundlist.item.push(newItemDoc);
            foundlist.save();
            res.redirect("/" + listName);
        });
    }


    //    if (req.body.list === "Work") {
    //        workItems.push(item);
    //        res.redirect("/work");
    //    } else {
    //        items.push(item);
    //        res.redirect("/");
    //    }
});


app.post("/dlt", function (req, res) {
//    const checkItemId = req.body.CheckBox;
//    const checkedListName = req.body.currentList[0];
//    console.log(checkedListName);
//    Item.findByIdAndRemove(checkItemId, function (err) {
//            if (err) {
//                console.log(err);
//            } else {
//                console.log("Successfully deleted Item")
//                res.redirect("/");
//            }
//        });
    
    const checkItemId = req.body.CheckBox;
    const checkItemList = req.body.currentList[0];
    console.log(checkItemList);
    if (checkItemList === "Today") {
        Item.findByIdAndRemove(checkItemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted Item")
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: checkItemList
        }, {
            $pull: {
                item: {_id: checkItemId}
            }
        }, function (err) {
            if (!err) {
                res.redirect("/" + checkItemList);
            }
        });
    }


});

//Creating dynamic routes.

app.get("/:CoustomListName", function (req, res) {
    const coustomListName = _.capitalize(req.params.CoustomListName);

    List.findOne({
        name: coustomListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //                console.log("doesn't exists");
                const list = new List({
                    name: coustomListName,
                    item: defaultItems
                });
                list.save();
                res.redirect("/" + coustomListName);
            } else {
                //                console.log("exists");
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.item
                });
            }
        }
    });


});

//app.get("/work", function (req, res) {
//    res.render("list", {
//        listTitle: "Work List",
//        newListItems: workItems
//    });
//});

//
//app.get("/about", function (req, res) {
//    res.render("about");
//});

let port = process.env.PORT;
if(port==null || port == ""){
    port = 3000;
}

app.listen( port, function () {
    console.log("Server started successfully");
});
