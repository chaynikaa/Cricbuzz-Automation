require("chromedriver");

let wd = require("selenium-webdriver");
let browser = new wd.Builder().forBrowser('chrome').build();
let matchId = 35663;
let innings = 1;
let batsmenColumns = ["matches","innings","notOut","runs","highestScore","average","ballsPlayed","strikeRate","hundreds","twoHundreds", "fifties", "fours","sixes"];
let bowlerColumns = ["matches","innings","balls","runs","wickets","bestBowlingInInnings","bestBowlingInMatch","economy","bowlingAverage","bowlingStrikeRate","fiveWickets","tenWickets"];

let inningsBatsmen = [];
let inningsBowler=[];
let careerData=[];
let fs = require('fs'); 


async function main() {
    await browser.get(`https://www.cricbuzz.com/live-cricket-scores/${matchId}`);
    await browser.wait(wd.until.elementLocated(wd.By.css(".cb-nav-bar a" )));
    let buttons = await browser.findElements(wd.By.css(".cb-nav-bar a" ));
  await buttons[1].click();

  await browser.wait(wd.until.elementLocated(wd.By.css(`#innings_${innings} .cb-col.cb-col-100.cb-ltst-wgt-hdr`)));

  
  let tables = await browser.findElements(wd.By.css(`#innings_${innings} .cb-col.cb-col-100.cb-ltst-wgt-hdr` ));
  let inningsBatsmenRows = await tables[0].findElements(wd.By.css(".cb-col.cb-col-100.cb-scrd-itms"));

  for (let i = 0;i < (inningsBatsmenRows.length - 3);i++)
  {
    let columns = await inningsBatsmenRows[i].findElements(wd.By.css("div"));
    if(columns.length == 7){
    let url = await (await columns[0].findElement(wd.By.css("a"))).getAttribute("href");
    let playername = await columns[0].getAttribute('innerText');
    careerData.push({"playerName":playername});
    inningsBatsmen.push(url);
  }
 }
  let inningsBowlerRows = await tables[1].findElements(wd.By.css(".cb-col.cb-col-100.cb-scrd-itms"));
  for(let i=0; i < (inningsBowlerRows.length);i++){
    let columns = await inningsBowlerRows[i].findElements(wd.By.css("div"));
    if(columns.length == 8){
        let url = await (await columns[0].findElement(wd.By.css("a"))).getAttribute("href");
        let playername = await columns[0].getAttribute('innerText');
        careerData.push({"playerName": playername});
    
    inningsBowler.push(url);
  }
  }
  let finalUrls = inningsBatsmen.concat(inningsBowler);
  for(i in finalUrls){
      await browser.get(finalUrls[i]);
      await browser.wait(wd.until.elementLocated(wd.By.css(".table.cb-col-100.cb-plyr-thead")))
   
         let tables = await browser.findElements(wd.By.css(".table.cb-col-100.cb-plyr-thead"));
      for(let j in tables){
        let data ={};

          let rows = await tables[j].findElements(wd.By.css("tbody tr"));
          for(row of rows){
            let tempData={};

           let columns = await row.findElements(wd.By.css("td"));
           let matchType = await columns[0].getAttribute("innerText");
            let keyArr = batsmenColumns;
            if(j ==1){
    keyArr= bowlerColumns;
}           for( let k=1; k<columns.length; k++){
             tempData[keyArr[k-1]]= await columns[k].getAttribute("innerText");
            }
            data[matchType] =tempData;
          } 
          if(j==0){
              careerData[i]["battingCareer"]= data;

                  } else{
                          careerData[i]["bowlingCareer"]=data;
                        }      
        }
    }
    console.log(careerData);
    fs.writeFileSync("career.json",JSON.stringify(careerData));

  }



main();
