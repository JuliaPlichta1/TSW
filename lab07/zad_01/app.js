const App = {
    data() {
        return {
            imie: "Julia",
            nazwisko: "Plichta",
            wiek: null,
            rokZPrzyszlosci: null,
            url: "https://i.pinimg.com/236x/45/5f/38/455f38c372e12fd6c5230878381b33dc.jpg"
        }
    },
    methods: {
        formatujWiek(wiek) {
            if (wiek === 1) return "rok";
            if ((wiek > 21 || wiek < 5) && (wiek % 10 === 2 || wiek % 10 === 3 || wiek % 10 === 4)) {
                return `${wiek} lata`;
            } else {
                return `${wiek} lat`;
            }
        },
        wypiszWiek() {
            const vm = this;
            if (vm.wiek === null) return "Twój wiek";
            const wiek = parseInt(vm.wiek);
            return `Mam ${vm.formatujWiek(wiek)}`;
        },
        czyRokZPrzyszlosci() {
            const vm = this;
            const rokZPrzyszlosci = parseInt(vm.rokZPrzyszlosci);
            const rokTeraz = new Date().getFullYear();
            return rokZPrzyszlosci > rokTeraz;
        },
        sprawdzRok() {
            const vm = this;
            const rokTeraz = new Date().getFullYear();
            const rokZPrzyszlosci = parseInt(vm.rokZPrzyszlosci);
            if (vm.wiek === null) return "Podaj swój wiek";
            const wiek = parseInt(vm.wiek);
            return ` W roku ${rokZPrzyszlosci} będę miał ${vm.formatujWiek(wiek + (rokZPrzyszlosci - rokTeraz))}`;
        }
    },
    computed: {
        losujLiczbe() {
            return Math.floor(Math.random() * 100);
        }
    }
}

Vue.createApp(App).mount('#zadanie01');