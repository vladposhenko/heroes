// Класс для осуществления запросов
class Controller {
    constructor(url,method = 'GET',body = null) {
        this.url = url
        this.method = method
        this.body = body
    }

    async fetchData() {
        let baseUrl = 'https://631243c3f5cba498da900054.mockapi.io'
        if(this.method === 'GET') {
            let request = await fetch(baseUrl + this.url)
            return await request.json()
        } else if (this.method === 'DELETE') {
            await fetch(baseUrl + this.url, {
                method: this.method,
            })
        } 
        else {
            let request = await fetch(baseUrl + this.url, {
                method: this.method,
                headers:{
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(this.body)
            })
            return await request.json()
        } 
    }
}

// Класс для работы с героями
class Hero {
    constructor (name, comics, favourite, id) {
        this.name = name
        this.comics = comics
        this.favourite = favourite
        this.id = id
    }

    async getAllHeroes () {
        let request = await new Controller('/heroes').fetchData()
        return await request
    }


    async changeFav (fav) {
        new Controller(`/heroes/${fav}`, 'PUT', {
            favourite: !this.favourite
        }).fetchData()
    }

    async deleteHero (hero) {
        await new Controller(`/heroes/${hero}`, "DELETE").fetchData()
        renderHerosTable()
    }

    render() {
        const tableBody = document.getElementById('tableBody')
        const tr = document.createElement('tr')
        const tdName = document.createElement('td')
        const tdComics = document.createElement('td')
        const tdFav = document.createElement('td')
        const tdAction = document.createElement('td')
        const label = document.createElement('label')
        const button = document.createElement('button')

        tdName.innerHTML = this.name
        tdComics.innerHTML = this.comics
        button.innerHTML = 'Delete'
        label.className = 'heroFavouriteInput'

        label.innerHTML = `Favourite: <input id="favCheck" type="checkbox" ${this.favourite ? 'checked' : null} >`

        label.addEventListener('click', async () => {
            this.changeFav(this.id)
        })
        button.addEventListener('click', async () => {
            this.deleteHero(this.id)
        })

        tdFav.append(label)
        tdAction.append(button)

        tr.append(tdName)
        tr.append(tdComics)
        tr.append(tdFav)
        tr.append(tdAction)
        tableBody.append(tr)

    }
}



// Функция для рендера всех героев.Вызывается при старте приложения
async function renderHerosTable () {
    const tableBody = document.getElementById('tableBody')
    tableBody.innerHTML = ""
    let heros = await new Hero(null, null, null).getAllHeroes()
    for(i = 0; i < heros.length; i++) {
        new Hero(heros[i].name, heros[i].comics, heros[i].favourite, heros[i].id).render()
    }
}


// Функция для получения option. Вызывается при старте приложения
async function getOptions () {
    const heroComics = document.querySelector('select[data-name="heroComics"]')
    let options = await new Controller('/universe').fetchData()
    options.forEach(optn => {
        const option = document.createElement('option')
        option.innerHTML = optn.comics
        option.value = optn.comics
        heroComics.appendChild(option)
    });
}


// Функция для проверки валидности введенного имя
async function checkHeroName (enteredName) {
    if(!enteredName) {
        return true
    }
    let allHeroes = await new Hero(null, null, null).getAllHeroes()
    let result = allHeroes.some((hero) => {
        if(hero.name === enteredName) {
            return true
        } else {
            return false
        }
    })
    return result
}

// Функция для получения id героя
async function getIdByName (name) {
    let allHeroes = await new Hero(null, null, null).getAllHeroes()
    let hero = allHeroes.find((hero) => hero.name === name)
    return hero.id
}

// Функция для обработки формы
const heroesForm = document.querySelector('#heroesForm')
heroesForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const heroName = document.querySelector('input[data-name="heroName"]').value
    const heroFavourite = document.querySelector('input[data-name="heroFavourite"]').checked
    const heroComics = document.querySelector('select[data-name="heroComics"]').selectedOptions[0].innerHTML

    let isExist = await checkHeroName(heroName)
    if(!isExist) {
        await new Controller('/heroes', 'POST', {
            name: heroName,
            comics: heroComics,
            favourite: heroFavourite
        }).fetchData()
        new Hero(heroName, heroComics, heroFavourite, await getIdByName(heroName)).render()
    } else {
        alert('incorrect user or already exist');
    }
})

// Вызов стартовых функций
renderHerosTable()
getOptions()