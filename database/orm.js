var orm = {};
orm.selectAll = function (tableName) {
    return new Promise((resolve,reject)=>{
        var sql = "select * from "+tableName;
        db.query(sql,function (error,results) {
            if (!error){
                resolve({error:0,msg:"查询到"+results.length+"条信息",results:{}});
            }
        })
    })
}