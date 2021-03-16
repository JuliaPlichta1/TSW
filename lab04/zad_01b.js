const fun1 = (number, cb) => {
    setTimeout(() => {
        console.log(number);
        cb(number * 10);
    }, Math.random() * 1000);
};

const fun2 = (number, prevResult, cb) => {
    setTimeout(() => {
        console.log(number);
        console.log(prevResult);
        cb({ res1: prevResult, res2: number * 10 });
    }, Math.random() * 1000);
};

const poKolei = (fun1, fun2, cb) => {
    fun1(1, (data) => {
        console.log(data);
        fun2(2, data, (data2) => {
            console.log(data2);
            cb(data2.res1, data2.res2);
        });
    });
};

poKolei(fun1, fun2, (res1, res2) => {
    console.log("Finished");
    console.log(res1);
    console.log(res2);
});
