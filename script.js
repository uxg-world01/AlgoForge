try {
    const data = await response.json();
    console.log(data);
} catch (err) {
    const text = await response.text();
    console.error("Server response:", text);
}