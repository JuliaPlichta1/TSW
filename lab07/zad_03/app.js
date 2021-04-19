const App = {
    data() {
        return {
            losowaLiczba: null,
            wynik: 0
        }
    },
    methods: {
        losuj (min, max) {
            const vm = this;
            return Math.floor(Math.random() * (max-min) + min);
        },
        dodaj(event, liczba) {
            const vm = this;
            vm.wynik += liczba;
            console.log(vm.wynik);
            console.log(vm.losowaLiczba);
        },
    },
    computed: {
        oblicz() {
            const vm = this;
            if (vm.wynik < vm.losowaLiczba) {
                return "Jeszcze nie";
            } else if (vm.wynik > vm.losowaLiczba) {
                return "Za dużo";
            } else return vm.losowaLiczba;
        }
    },
    watch: {
        wynik() {
            const vm = this;
            const wynikBefore = vm.wynik;
            setTimeout(() => {
                const wynikAfter = vm.wynik;
                if (wynikBefore === wynikAfter) {
                    console.log("reset wynik");
                    vm.wynik = 0;
                }
            }, 5000);
        }
    },
    beforeMount() {
        const vm = this;
        vm.losowaLiczba = vm.losuj(10, 50);
    },
};

Vue.createApp(App).mount('#zadanie03');