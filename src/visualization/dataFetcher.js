
const map = document.getElementById("map")
const inputs = document.querySelectorAll("div input[type=checkbox]")

const updateCheckbox = () => {
    const input = []
    inputs.forEach(checkbox => {
        input.push(checkbox.checked ? 1 : 0)
    })
    localStorage.setItem("checkboxes", JSON.stringify(input))
}


const fetchGame = async () => {
    const input = []
    inputs.forEach(checkbox => {
        input.push(checkbox.checked ? 1 : 0)
    })

    fetch(`http://localhost:3000/send/${input}`).then(response => {
        response.json().then(response => {

            if (!response.hasLost) {
                // Clear Map
                map.innerHTML = ""

                const modifiedMap = []
                for (let index = 0; index < 200; index += 10) {
                    modifiedMap.push(response.projectedMap.slice(index, index + 10))
                }
                const flatMap = modifiedMap.reverse().flat()

                flatMap.forEach(cell => {
                    const node = document.createElement("div")
                    node.style.backgroundColor = cell === 1 ? "white" : "black"
                    map.appendChild(node)
                });
            } else {
                map.innerHTML = ""
                for (let index = 0; index < 200; index++) {
                    const node = document.createElement("div")
                    node.style.backgroundColor = "black"
                    node.id = index
                    map.appendChild(node)
                }

                const endScreen = [12, 21, 31, 41, 51, 62, 63, 13, 44, 54, 43, 36, 26, 17, 28, 38, 141, 132, 123, 124, 125, 126, 137, 148, 92, 102, 97, 107]

                endScreen.forEach(index => {
                    map.children[index].style.backgroundColor = "white"
                })
            }
        });
    })
}
fetchGame()

const submit = () => {
    fetchGame()
}


window.onload = (event) => {
    JSON.parse(localStorage.getItem("checkboxes")).forEach((checkbox, index) => {
        inputs[index].checked = checkbox === 1 ? true : false
    })
}