const express = require("express");
const app = express();

// YOUR CODE GOES IN HERE
app.get("/", function (req, res) {
  res.send("Hello World");
});

//creating a blog
app.post("/blogs", (req, res) => {
  const { title, content } = req.body;
  fs.writeFileSync(title, content);
  res.end("ok");
});

// updating a blog
app.put("/blogs/:title", (req, res) => {
  const { title } = req.params;
  const { content } = req.body;
  if (fs.existsSync(title)) {
    fs.writeFileSync(title, content);
    res.end("ok");
  } else {
    res.status(404).send("This blog does not exist!");
  }
});

//deleting a blog
app.delete("/blogs/:title", (req, res) => {
  const { title } = req.params;
  if (fs.existsSync(title)) {
    fs.unlinkSync(title);
    res.end("ok");
  } else {
    res.status(404).send("This blog does not exist!");
  }
});

//serving a blog
app.get("/blogs/:title", (req, res) => {
  const { title } = req.params;
  if (fs.existsSync(title)) {
    const blogContent = fs.readFileSync(title, "utf8");
    res.send(blogContent);
  } else {
    res.status(404).send("This blog does not exist!");
  }
});
app.listen(3000);
