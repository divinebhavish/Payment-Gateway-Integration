import TshirtImg from "./Shirtt.svg";

function Product() {

    const paymentHandler = async (e) => {

        try {

            console.log("Payment button clicked");

            const response = await fetch("http://localhost:5001/order", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    amount: 500000,
                    currency: "INR",
                    receipt: "qwsaq3"
                })
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend error:", errorData);
                return;
            }

            const order = await response.json();

            console.log("ORDER CREATED:", order);

            // Razorpay Checkout option

            var options = {
                "key": "rzp_test_TegOcFIbvhl851", // Enter the Key ID generated from the Dashboard
                amount: order.amount, // Amount is in currency subunits.
                currency: order.currency,
                "name": "Acme Corp", //your business name
                "description": "Test Transaction",
                "image": "https://example.com/your_logo",
                "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
                "handler": async function (response){
                    const body = {
                        ...response,
                    }

                    const validateRes = await fetch("http://localhost:5001/order/validate", {
                        method: "POST",
                        body: JSON.stringify(body),
                        headers: {
                            "Content-Type": "application/json"
                        },
                        
                    })

                    const jsonRes = await validateRes.json();
                    console.log(jsonRes)

                },
                "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
                    "name": "Mewara Bricks", //your customer's name
                    "email": "mewarabricks@gmail.com", 
                    "contact": "9414613911"  //Provide the customer's phone number for better conversion rates 
                },
                "notes": {
                    "address": "Razorpay Corporate Office"
                },
                "theme": {
                    "color": "#3399cc"
                }
            };
            var rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response){
                    alert(response.error.code);
                    alert(response.error.description);
                    alert(response.error.source);
                    alert(response.error.step);
                    alert(response.error.reason);
                    alert(response.error.metadata.order_id);
                    alert(response.error.metadata.payment_id);
            });

            rzp1.open();
            e.preventDefault();

        } catch (error) {

            console.error("FETCH ERROR:", error);

        }
    };

    


    return (
        <div className="product">

            <h1>Product Page</h1>

            <h2>T-Shirt</h2>

            <p>Solid Blue Tees</p>

            <img src={TshirtImg} alt="T-Shirt" />

            <button onClick={paymentHandler}>
                Pay here to Place your order
            </button>

        </div>
    );
}

export default Product;