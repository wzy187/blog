function getAll(tableName){
    return new Promise((resolve,reject)=>{
        var sql = "select * from "+tableName;
        db.query(sql,function (error,results) {
            if (!error&&results.length>0){

            }
        })
    })
}
async function getData(){
    var data={};
    data.articles = await getAll("articles");
    data.category = await getAll("category");
    console.log(data)
}
getData();