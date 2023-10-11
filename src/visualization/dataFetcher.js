
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
fetchGame([0, 0, 0, 0, 0, 0])

const submit = () => {
    fetchGame([0, 0, 0, 0, 0, 0])
}
