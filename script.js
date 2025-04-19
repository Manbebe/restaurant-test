document.addEventListener("DOMContentLoaded", function() {
    // Sample data (hidden item is added as a special "item")
    const menu = [
        { id: 1, name: "Pizza", price: 10, stock: 10 },
        { id: 2, name: "Burger", price: 5, stock: 20 },
        { id: 3, name: "Salad", price: 7, stock: 15 },
    ];

    // Hidden item with 0.1% chance to be ordered
    const hiddenItem = {
        name: "The Hidden Item",
        price: 1000, 
        stock: 1
    };

    // Initialize game state
    let totalEarnings = 0; // Start total earnings at 0
    let day = parseInt(localStorage.getItem("day")) || 1; // Load the current day from localStorage
    let gameOver = JSON.parse(localStorage.getItem("gameOver")) || false; // Load game state from localStorage
    let dayInProgress = false;
    let orders = [];
    let orderInterval;

    // Load the menu
    const menuList = document.getElementById("menu-list");
    menu.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - $${item.price}`;
        menuList.appendChild(li);
    });

    // Start the day (Simulate random orders)
    document.getElementById("start-day-btn").onclick = function() {
        if (dayInProgress || gameOver) {
            if (gameOver) {
                // Reset game state when starting a new day after game over
                resetGame();
                alert("Starting a new game!");
            } else {
                alert("The day is already in progress!");
            }
            return;
        }

        dayInProgress = true;
        document.getElementById("start-day-btn").textContent = "Day In Progress...";
        orders = [];
        updateDashboard();

        // Simulate random orders every 1 seconds
        orderInterval = setInterval(generateRandomOrder, 1000); // 1 seconds
    };

    // Stop the day (End of the day)
    document.getElementById("skip-day-btn").onclick = function() {
        if (!dayInProgress) {
            alert("No day in progress!");
            return;
        }

        clearInterval(orderInterval);
        dayInProgress = false;
        document.getElementById("start-day-btn").textContent = "Start Day";
        day++;
        updateDashboard();
    };

    // Generate random order
    function generateRandomOrder() {
        if (gameOver) return; // If game over, stop the orders

        // 0.1% chance of getting the hidden item
        if (Math.random() < 0.001) {
            // The Hidden Item is ordered
            handleHiddenItem();
        } else {
            // Normal item selection
            const randomItem = menu[Math.floor(Math.random() * menu.length)];
            if (randomItem.stock > 0) {
                randomItem.stock -= 1;
                orders.push(randomItem);
                totalEarnings += randomItem.price;
                updateDashboard();
            } else {
                // If out of stock, trigger game over
                gameOver = true;
                clearInterval(orderInterval); // Stop further orders
                alert(`Game Over! You ran out of stock for ${randomItem.name}.`);
                document.getElementById("start-day-btn").textContent = "Game Over! Start a new day.";
            }
        }
    }

    // Handle the hidden item order (screen goes black and closes tab)
    function handleHiddenItem() {
        // Hide all the UI elements
        document.getElementById("start-day-btn").style.display = 'none';
        document.getElementById("skip-day-btn").style.display = 'none';
        document.getElementById("buy-food-btn").style.display = 'none';
        document.getElementById("menu-list").style.display = 'none';
        document.getElementById("inventory-list").style.display = 'none';
        document.getElementById("order-summary").style.display = 'none';

        // Create a black screen
        document.body.style.backgroundColor = 'black';
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        const message = document.createElement("div");
        message.style.position = "absolute";
        message.style.top = "50%";
        message.style.left = "50%";
        message.style.transform = "translate(-50%, -50%)";
        message.style.color = "red";
        message.style.fontSize = "2rem";
        message.style.fontFamily = "Arial, sans-serif";
        message.style.textAlign = "center";
        message.textContent = "You found me... but was it worth it?";

        document.body.appendChild(message);

        // After 3 seconds, close the tab
        setTimeout(function() {
            window.close(); // Attempt to close the tab
        }, 3000); // 3 seconds delay
    }

    // Restock food (spend money)
    document.getElementById("buy-food-btn").onclick = function() {
        if (gameOver) {
            alert("Game Over! Start a new day to play again.");
            return;
        }

        menu.forEach(item => {
            if (item.stock <= 3) {
                // Deduct money for each restocked item (10 items per food)
                const cost = item.price * 10;
                if (totalEarnings >= cost) {
                    item.stock += 10; // Restock by 10 items
                    totalEarnings -= cost; // Spend money
                } else {
                    alert("Not enough money to restock!");
                }
            }
        });
        updateDashboard();
    };

    // Update dashboard with current orders, inventory, and earnings
    function updateDashboard() {
        // Update orders
        const orderSummary = document.getElementById("order-summary").getElementsByTagName("tbody")[0];
        orderSummary.innerHTML = "";
        const orderCount = {};
        orders.forEach(order => {
            if (!orderCount[order.name]) {
                orderCount[order.name] = 0;
            }
            orderCount[order.name]++;
        });

        for (const itemName in orderCount) {
            const row = orderSummary.insertRow();
            const item = menu.find(m => m.name === itemName);
            const percentage = ((orderCount[itemName] / orders.length) * 100).toFixed(2);
            row.innerHTML = `<td>${item.name}</td><td>${orderCount[itemName]}</td><td>${percentage}%</td>`;
        }

        // Update earnings (always starts at 0)
        document.getElementById("total-earnings").textContent = totalEarnings.toFixed(2);

        // Update inventory
        const inventoryList = document.getElementById("inventory-list");
        inventoryList.innerHTML = "";
        menu.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item.name}: ${item.stock} remaining`;
            inventoryList.appendChild(li);
        });

        // Save the game state to localStorage
        localStorage.setItem("day", day);
        localStorage.setItem("gameOver", JSON.stringify(gameOver));
    }

    // Reset game state
    function resetGame() {
        // Reset all values and start a new game
        gameOver = false;
        totalEarnings = 0;
        orders = [];
        menu.forEach(item => item.stock = 10); // Reset stock
        localStorage.removeItem("gameOver"); // Remove previous game state
        localStorage.removeItem("totalEarnings"); // Remove previous earnings from localStorage
        updateDashboard(); // Update UI
    }

    // Initial dashboard update
    updateDashboard();
});
