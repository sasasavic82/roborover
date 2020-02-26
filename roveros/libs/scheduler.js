/**
 * Queue Class
 */
class Scheduler {
    constructor() {
        this.queue = [];
        this.isBlocked = false;
    }

    /**
     * Add an item to the queue
     * @param {any} item 
     */
    add(item) {
        console.log('debug','[QUEUE]', `Added item: ` + JSON.stringify(item));
        this.report();
        this.queue.unshift(item);
    }

    /**
     * Remove next item from the queue
     */
    remove() {
        let item = this.queue.pop();
        console.log('debug','[QUEUE]', `Removed item: ` + JSON.stringify(item));
        this.report();
        return item;
    }

    /**
     * Return first item from the queue
     */
    first() {
        return this.queue[0];
    }

    /**
     * Return last item from the queue
     */
    last() {
        return this.queue[this.queue.length -1];
    }

    /**
     * Queue size
     */
    size() {
        return this.queue.length;
    }

    /** 
     * Blocking function that awaits from messages in the queue  
     */
    waitForMessage() {
        if(this.size() > 0 && !this.isBlocked) return true;
        return false;
    }

    /** 
     * Block processing 
    */
    block() {
        this.isBlocked = true;
    }

    /**
     * Unblock processing
     */
    unblock() {
        this.isBlocked = false;
    }

    /**
     * Report on queue
     */
    report() {
        console.log('debug','[SCHEDULER]', 'Size: ' + this.size());
        console.log('debug','[SCHEDULER]', 'Blocked: ' + this.isBlocked);
        console.log('debug','[SCHEDULER]', 'Content: ' + JSON.stringify(this.queue));
    }
}

module.exports = Scheduler;