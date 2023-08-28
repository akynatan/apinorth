function order(a: any, b: any) {
    var nameA = a[0].toUpperCase();
    var nameB = b[0].toUpperCase();

    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }

    return 0;
}

export { order }