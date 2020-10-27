import React from "react";
import moment from "moment"

const TransactionItem = ({ response }) => {

    const badge = (
        <><span>priority: </span><span className={response.priority == "low" ? "badge badge-success" : response.priority == "medium" ? "badge badge-info"  : "badge badge-danger"}>{response.priority}</span></>
    );
    const value = <h4 className="font-medium">command: {response.type}</h4>;
    const notes = <span className="mb-3 d-block">{response.commandId}</span>
    const date = <span className="text-muted float-right">{moment(response.timestamp).fromNow(true)} ago</span>
    return (
        <div className="d-flex flex-row comment-row pb-2 mt-1 border-bottom">
            <div className="comment-text w-100">
                {value}
                {notes}
                <div className="comment-footer">
                    {date}
                    {badge}
                </div>
            </div>
        </div>
    );
}

export default TransactionItem;