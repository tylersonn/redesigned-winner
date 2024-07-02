const express = require("express");
const path = require("path");
const fs = require("fs");
const simpleGit = require("simple-git");
const ncp = require('ncp').ncp
// const execa = require('execa')

const port = 8080;
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is my node application for CICD application");
});

app.post("/push", async (req, res) => {
  const { branch_name  } = req.body

  try {
    if(!branch_name ){
      return res.status(400).json({error: "Branch is required"})
    }

    const gitlab_url = "https://github.com/tylersonn/reimagined-train.git";

    // fetch sf_app
    const sf_app = path.join(__dirname, 'automatedcode');

    // Check if the directory exists
    if (!fs.existsSync(sf_app)) {
      return res.status(400).json({ error: "Directory not found" });
    }

     // Change directory to sf_app
     process.chdir(sf_app);

     // Check if .git exists
     if (!fs.existsSync(path.join(sf_app, '.git'))) {
      await import('execa').then(async execa => {
        // Initialize git
        await execa.execa('git', ['init'], { cwd: sf_app });
        
        // Add remote URL
        await execa.execa('git', ['remote', 'add', 'origin', gitlab_url], { cwd: sf_app });
        
        // console.log('Git initialized and remote added successfully');
      }).catch(error => {
        console.error('Failed to initialize git or add remote', error);
        throw new Error('Failed to initialize git or add remote');
      });    
     }

     // Do a git add and commit
     const { execa } = await import('execa');
    
     await execa('git', ['add', '.'], { cwd: sf_app });
     await execa('git', ['commit', '-m', 'automated push'], { cwd: sf_app });
     await execa('git', ['push', 'origin', branch_name], { cwd: sf_app });


    return res.json({ success: "Folder pushed to GitLab successfully" });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}/`);
});

