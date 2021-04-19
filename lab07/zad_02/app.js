const App = {
    data() {
        return {
            wynik1: "WYNIK 1",
            wynik2: "WYNIK 2"
        }
    },
    methods: {
        showAlert() {
            alert("To jest jakiś alert");
        },
        writeKey(event) {
            const vm = this;
            if (event.target.value === "") {
                vm.wynik1 = "WYNIK 1";
            } else {
                vm.wynik1 = event.target.value;
            }
        },
        confirm(event) {
            const vm = this;
            if (event.target.value === "") {
                vm.wynik2 = "WYNIK 2";
            } else {
                vm.wynik2 = event.target.value;
            }
        }
    },
}

Vue.createApp(App).mount("#zadanie02");