let names = ["Morten","Thomas","Katrine","Karsten","Anne","Mette"];
let klasse = ["4","1","3","5","4","6"];
let rounds = [8,2,4,0,14,5];
let time = [];



var CronJob = require('cron').CronJob;
var job = new CronJob('* * * * * *', function() {

for(var i = 0; i < 5;i++) {
    console.log(names[i]+"\t"+"\t"+klasse[0]+"\t"+rounds[0]);
}







  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');
job.start();





