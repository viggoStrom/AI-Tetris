
const map = document.getElementById("map")

const fetchGame = async (input) => {
    fetch(`http://localhost:3000/send/${input}`).then(response => {
        response.json().then(response => {

            if (!response.hasLost) {
                // Clear Map
                map.innerHTML = ""

                // Flip and mirror the map
                const modifiedMap = []
                for (let index = 0; index < 200; index += 10) {
                    modifiedMap.push(response.projectedMap.slice(index, index + 10))
                }
                const flatMap = modifiedMap.reverse().flat()

                // Create nice looking squares
                flatMap.forEach(cell => {
                    const outline = document.createElement("div")
                    outline.style.backgroundColor = "black"

                    if (cell) {
                        const infill = document.createElement("div")
                        infill.style.backgroundColor = "white"
                        infill.style.width = "95%"
                        infill.style.marginLeft = "2.5%"
                        infill.style.height = "95%"
                        infill.style.marginTop = "2.5%"

                        outline.appendChild(infill)
                    }

                    map.appendChild(outline)
                });

                const scoreSpan = document.getElementById("score")
                scoreSpan.innerHTML = response.score
            } else {
                map.innerHTML = ""
                for (let index = 0; index < 200; index++) {
                    const node = document.createElement("div")
                    node.style.backgroundColor = "black"
                    node.id = index
                    map.appendChild(node)
                }

                const endScreen = [103, 104, 105, 106, 112, 117, 121, 128, 72, 77, 82, 87]

                endScreen.forEach(cellIndex => {
                    map.children[cellIndex].style.backgroundColor = "white"
                })
            }
        });
    })
}
// fetchGame([0, 0, 0, 0, 0, 0])

const submit = () => {
    fetchGame([0, 0, 0, 0, 0, 0])
}

const keypress = (event) => {
    switch (event.key) {
        case " ":
            event.preventDefault()
            fetchGame([0, 0, 0, 0, 0, 0])
            break;

        case "a":
        case "ArrowLeft":
            event.preventDefault()
            fetchGame([1, 0, 0, 0, 0, 0])
            break;

        case "d":
        case "ArrowRight":
            event.preventDefault()
            fetchGame([0, 1, 0, 0, 0, 0])
            break;

        case "s":
        case "ArrowDown":
            event.preventDefault()
            fetchGame([0, 0, 1, 0, 0, 0])
            break;

        case "e":
        case "z":
            fetchGame([0, 0, 0, 0, 0, 1])
            break;

        case "q":
        case "c":
            fetchGame([0, 0, 0, 0, 1, 0])
            break;

        case "Enter":
            event.preventDefault()
            fetchGame([0, 0, 0, 1, 0, 0])
            break;

        case "ArrowUp":
            event.preventDefault()
            break;

        default:
            break;
    }
}

document.addEventListener("keydown", keypress)


const replay = () => {
    fetch(`http://localhost:3000/ask/`).then(response => {
        response.text().then(response => {
            const flatMap = response.replaceAll("\"", "").split(",")

            const scoreSpan = document.getElementById("score")
            scoreSpan.innerHTML = score

            const oneFrame = (data, index) => {
                map.innerHTML = ""

                data.forEach((cell, localIndex) => {

                    const background = document.createElement("div")
                    background.style.backgroundColor = "black"
                    background.id = index + localIndex

                    if (cell === "1") {
                        const infill = document.createElement("div")
                        infill.style.backgroundColor = "white"
                        infill.style.width = "95%"
                        infill.style.marginLeft = "2.5%"
                        infill.style.height = "95%"
                        infill.style.marginTop = "2.5%"
                        infill.id = index + localIndex

                        background.appendChild(infill)
                    }

                    map.appendChild(background)

                    const frameSpan = document.getElementById("frame")
                    frameSpan.innerHTML = index % 200
                })
            }


            for (let index = 0; index < flatMap.length; index += 200) {

                const frameData = []
                for (let localIndex = index; localIndex < index + 200; localIndex++) {
                    frameData.push(flatMap[localIndex])
                }

                setTimeout(() => {
                    oneFrame(frameData.reverse(), index)
                }, 500 + index );
            }
        });
    })
}

replay()
