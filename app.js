
const express=require('express');
const bodyparser =require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")
const app=express();

let workitems=[];
let newlistitems=[];


app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extended:true})); 
app.use(express.static("public"))
mongoose.connect("mongodb://127.0.0.1:27017/todolistdb")
const itemsschema={
    name:String
};

const Item=mongoose.model("Item",itemsschema);
const item1=new Item({
    name:"welcome to ur todolist"
})
const item2=new Item({
    name:"Hit the + button to add items"
})
const item3=new Item({
    name:"<-- hit this to delete an item"
})


const defaultitems=[item1,item2,item3];
const listschema={
  name:String,
  items:[itemsschema]
};
const List=mongoose.model("List",listschema)
app.get("/", async function(req, res) {
    
      const foundItems = await Item.find({}); // Execute the query using await
      if(foundItems.length===0)
      {
        
        Item.insertMany(defaultitems)

         res.redirect("/");
      }
  else{
      res.render("list", {
        listtitle: "Today",
        newlistitems: foundItems,
      })}
    
    
  });
  
    
        
    app.post("/",async function(req,res){
        const itemname= req.body.newitem;
        const listname=req.body.list; 
        const item=new Item({
          name:itemname
           })
        if(listname==="Today"){
          item.save();
          res.redirect("/")
        }
        else{
          
          try{
          let foundlist = await List.findOne({name:listname});
          foundlist.items.push(item)
          
          foundlist.save();
          res.redirect("/"+ listname);
        }
          catch(err){
            console.log(err);
          }
          
        }
        
       
        })
        app.post("/delete", async function(req, res) {
          
            const checkedItemId = req.body.checkbox.trim();
            const listname=req.body.listname;
            if(listname==="Today"){
              if (!mongoose.Types.ObjectId.isValid(checkedItemId)) {
                return res.status(400).json({ error: "Invalid item identifier" });
              }
              const deletedItem = await Item.findOneAndDelete({ _id: checkedItemId });
  
              res.redirect("/")

            }
            else{
              await List.findOneAndUpdate(
                { name: listname },
                { $pull: { items: { _id: checkedItemId } } }
              );
          
              res.redirect("/" + listname);
            
            
            
            }

            

        });
        app.get("/:customlistname", async function(req, res) {
          const customlistname = _.capitalize(req.params.customlistname);
        
          try {
            let foundlist = await List.findOne({ name: customlistname });
        
            if (!foundlist) {
              // If the list with the given name does not exist, create a new list
              const list = new List({
                name: customlistname,
                items: defaultitems,
              });
        
              await list.save();
              foundlist = list;
              res.redirect("/"+customlistname)
            }
        
            // Render the "list" view with the foundlist data (whether existing or newly created)
            res.render("list", {
              listtitle: foundlist.name,
              newlistitems: foundlist.items,
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Something went wrong" });
          }
        });
        
      
        
     
      
        
         app.post("/work",function(req,res){
            let item=req.body.newitem;
            workitems.push(item);
            res.redirect("/work");

         });
         app.get("/about",function(req,res){
            res.render("about");
         });


   
    
 
   












app.listen(3000,function(){
    console.log("running");
});

