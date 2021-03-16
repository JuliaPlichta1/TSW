const fun1 = (cb) => {
    setTimeout(() => {
        console.log('fun1');
        cb(1);
    }, Math.random() * 1000);
};

const fun2 = (cb) => {
    setTimeout(() => {
        console.log('fun2');
        cb(2);
    }, Math.random() * 1000);
};

const poKolei = (fun1, fun2, cb) => {
    fun1((number) => {
        console.log(number);
        fun2((secNumber) => {
            console.log(secNumber);
            cb(number, secNumber);
        });
    });
};

poKolei(fun1, fun2, (one, two) => {
    console.log("Finished");
    console.log(one, two);
});
