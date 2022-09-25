// jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "bring food"
});

const item2 = new Item({
  name: "make food"
});

const item3 = new Item({
  name: "eat food"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/",function(req, res){

    Item.find((err, founditems) => {
      if(founditems.length === 0){
        Item.insertMany(defaultItems, (err)=>{
          if(err){
            console.log(err);
          }else{
            console.log("added items successfully");
          }
        });

      }else{
        res.render("list", {listTitle: "Today", newListItems: founditems});
      }

      // if(err){
      //   console.log(err);
      // }else{
      //   // mongoose.connection.close();
      //
      //   // items.forEach((item) => {
      //     res.render("list", {listTitle: "Today", newListItems: founditems});
      //   // });
      // }
    });
});

app.get("/:customListName", (req, res)=>{
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, (err, foundList)=>{
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      } else{
        console.log("successfully deleted");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});


app.post("/work", function(req,res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("The app is now listening on port 3000");
})
