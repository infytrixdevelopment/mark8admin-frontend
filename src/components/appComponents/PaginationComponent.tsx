import { Pagination } from "@mui/material"
import React from "react";
import { TEXT_PRIMARY } from "../../constants/textColorsConstants";

const PaginationComponent: React.FC<{ page: number, limit: number, totalRows: number, onChange: (page: number) => void }> = ({ page, limit, totalRows, onChange }) => {
    //--------------------Pagination Function-----------------------
    const getPaginationInfo = (page: number, limit: number, totalRows: number): string => {
        let start;
        if (totalRows === 0) {
            start = 0;
        }
        else {
            start = (page - 1) * limit + 1;
        }
        let end = page * limit;
        if (end > totalRows) {
            end = totalRows;
        }

        return `${start}-${end} of ${totalRows}`;
    }
    //--------------------Pagination Function-----------------------

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        }}>
            <div style={{ 
                fontSize: 12, 
                fontWeight: 400, 
                lineHeight: "18px", 
                marginRight: "36px",
                color: TEXT_PRIMARY.GREY }}>
                {getPaginationInfo(page, limit, totalRows)}
            </div>
            <Pagination
                page={page}
                count={Math.ceil(totalRows / limit)}
                onChange={(_, page) => onChange(page)}
                shape="rounded"
                color="primary"
                sx={{
                    '& .MuiPaginationItem-root': {
                        color: TEXT_PRIMARY.PURPLE,
                        '&.Mui-selected': {
                            backgroundColor: TEXT_PRIMARY.PURPLE,
                            color: '#FFF',
                            '&:hover': {
                                backgroundColor: TEXT_PRIMARY.PURPLE,
                                opacity: 0.8
                            }
                        },
                        '&:hover': {
                            backgroundColor: '#F9F7FE'
                        }
                    }
                }} />
        </div>
    )

}

export default PaginationComponent;