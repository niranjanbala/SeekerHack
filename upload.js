var fs=require('fs');
var array = fs.readFileSync('./All-Data.csv', 'utf8').split("\n");
var object={};
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
array.forEach(function  (item) {
	var data=item.split(',');
	var projectName=data[0];
	var projectId=data[1];
	var count=Number(data[2]);
	var month=data[3];

	if(!object[projectName]){
		object[projectName]={
			name: toTitleCase(projectName.replace(/-/g,' ')),
			projectId:projectId,
			gaStats:[]
		}		
	}
	object[projectName].gaStats.push({
		month: month,
		count: count
	})
})
var arrayData=[]
Object.keys(object).forEach(function(keys){
	if(object[keys].gaStats.length==3){
		arrayData.push(object[keys]);
	}
})
console.log(JSON.stringify({"results": arrayData}));