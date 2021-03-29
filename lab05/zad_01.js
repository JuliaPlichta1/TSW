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

const razemTab = async (funTab) => {
    const results = [];
    const promises = [];
    funTab.forEach((func) => {
        promises.push(func(results));
    });

    for (let i = 0; i < promises.length; i++) {
        let somePromise = await promises[i];
    }
    return results; 
};


const results = razemTab([fun1, fun2, fun3, fun4]);
results.then((data) => {
    console.log("Finished");
    data.forEach((item) => {
        console.log(`Data from functions: ${item}`);
    });
})
