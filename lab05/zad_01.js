const fun1 = async (results) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('fun1');
            results.push(1);
            resolve(results);
        }, Math.random() * 1000);
    });
};

const fun2 = async (results) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('fun2');
            results.push(2);
            resolve(results);
        }, Math.random() * 1000);
    });
};

const fun3 = async (results) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('fun3');
            results.push(3);
            resolve(results);
        }, Math.random() * 1000);
    });
};

const fun4 = async (results) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('fun4');
            results.push(4);
            resolve(results);
        }, Math.random() * 1000);
    });
};

const call = async (func) => {
    let results = [];
    let data = await func(results);
    console.log(data);
};

const razemTab = async(funTab) => {
    return new Promise(resolve => {
        var results = [];

        var check = (results) => {
            if (results.length === funTab.length) {
                resolve(results);
            }
        };

        funTab.forEach((fun) => {
            fun(results);
        });
    });
    
};


razemTab([fun1, fun2, fun3, fun4]);
