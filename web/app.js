var express = require("express");
var app = express();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
var bodyParser = require('body-parser');

var router = express.Router();
app.use(bodyParser.json());

var i = 0
app.use(express.static('public'));

var paths = __dirname + '/views/';
console.log("__dirname= " + __dirname);

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

app.get("/",function(req,res){
  res.sendFile(paths + "index.html");
});


app.post("/generate", (req, res) => {
    let text = req.body.text

	console.log("python index.py " + text)
    const pythonProcess = spawn('python', ['index.py', text]);

    let audioData = Buffer.from('');

    pythonProcess.stdout.on('data', (data) => {
        audioData = Buffer.concat([audioData, data]);
    });

    pythonProcess.stderr.on('data', (error) => {
        console.error(`Error from Python script: ${error}`);
        res.status(500).send('Internal Server Error');
    });

    pythonProcess.on('close', (code) => {
        if (code === 0) {
			i += 1
            const outputFile = "output" + i + ".wav";
			const directory = __dirname + '/public/tmp/';

			fs.readdir(directory, (err, files) => {
				if (err) throw err;
			  
				for (const file of files) {
				  fs.unlink(path.join(directory, file), (err) => {
					if (err) throw err;
				  });
				}
			  });
			const outputFilePath = path.resolve(__dirname + '/public/tmp/', outputFile); // Resolve the path
            fs.writeFile(outputFilePath, audioData, 'binary', (err) => {
                if (err) {
                    console.error(`Error writing audio data to file: ${err}`);
                    res.status(500).send('Internal Server Error');
                } else {
                    console.log(`Audio data written to ${outputFile}`);
					res.header('Content-Type', 'audio/wav');
                    res.send("/tmp/output" + i + ".wav");
                }
            });
        } else {
            console.error(`Python script exited with code ${code}`);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.use("/",router);

app.listen(8081, function () {
  console.log('Example app listening on port 8081!')
})