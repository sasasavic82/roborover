class Queue {
    constructor() {
        this.queue = [];
        this.isBlocked = false;
    }

    add(item) {
        console.log('debug','[QUEUE]', `Added item: ` + JSON.stringify(item));
        this.report();
        this.queue.unshift(item);
    }

    remove() {
        let item = this.queue.pop();
        console.log('debug','[QUEUE]', `Removed item: ` + JSON.stringify(item));
        this.report();
        return item;
    }

    first() {
        return this.queue[0];
    }

    last() {
        return this.queue[this.queue.length -1];
    }

    size() {
        return this.queue.length;
    }

    waitForMessage() {
        if(this.size() > 0 && !this.isBlocked) return true;
        return false;
    }

    block() {
        this.isBlocked = true;
    }

    unblock() {
        this.isBlocked = false;
    }

    report() {
        console.log('debug','[QUEUE]', 'Size: ' + this.size());
        console.log('debug','[QUEUE]', 'Blocked: ' + this.isBlocked);
        console.log('debug','[QUEUE]', 'Content: ' + JSON.stringify(this.queue));
    }
}

module.exports = Queue;