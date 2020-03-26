let names = ["Morten","Thomas","Katrine","Karsten","Anne","Mette"];
let klasse = ["4","1","3","5","4","6"];
let rounds = [8,2,4,0,14,5];
let time = [];

let a = 0;

for(var i = 0; i < 5;i++) {
    //console.log(names[i]+"\t"+"\t"+klasse[0]+"\t"+rounds[0]);
}



  console.log(names[a] + "\t" +klasse[a] + "\t" + rounds[a] );

  a++;

  if (a >= names.length) {
      a = 0;
  }



document.getElementById("highscore").innerHTML = "23";


