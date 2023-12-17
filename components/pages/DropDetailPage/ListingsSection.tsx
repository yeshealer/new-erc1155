import { useRouter } from "next/navigation";
import { Player } from "@lottiefiles/react-lottie-player"
import { Stack } from "@mui/material"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableHead from '@mui/material/TableHead';
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Icon } from "@iconify/react";
import { useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import useNFTDetail from "@/hooks/useNFTDetail";

function TablePaginationActions(props: any) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event: any) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: any) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: any) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: any) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <Icon icon="ic:round-last-page" /> : <Icon icon="ic:round-first-page" />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <Icon icon="mingcute:right-line" /> : <Icon icon="mingcute:left-line" />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <Icon icon="mingcute:left-line" /> : <Icon icon="mingcute:right-line" />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <Icon icon="ic:round-first-page" /> : <Icon icon="ic:round-last-page" />}
            </IconButton>
        </Box>
    );
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

interface ListingsSectionProps {
    totalListings: any
    nftData: any,
    availableUsers: any
    getMainData: () => void
}

export default function ListingsSection({
    totalListings,
    nftData,
    availableUsers,
    getMainData,
}: ListingsSectionProps) {
    const router = useRouter();
    const { address } = useAccount();

    const {
        handleCancelList,
        handleBuyListToken
    } = useNFTDetail();

    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(0);
    console.log(totalListings)

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * limit - totalListings.length) : 0;

    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className="join join-vertical w-full mt-5">
            <div className="collapse collapse-arrow join-item border border-base-300">
                <input type="checkbox" name="my-accordion-4" />
                <div className="collapse-title text-base font-medium">
                    Listings
                </div>
                <div className="collapse-content">
                    {(totalListings && totalListings.length > 0) ? (
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 500 }} size='small' aria-label="custom pagination table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left">Price</TableCell>
                                        <TableCell align="left">Amount</TableCell>
                                        <TableCell align="left">From</TableCell>
                                        <TableCell align="left" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(limit > 0
                                        ? totalListings.slice(page * limit, page * limit + limit)
                                        : totalListings
                                    ).map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {row.price}
                                            </TableCell>
                                            <TableCell style={{ width: 160 }} align="left">
                                                {row.amount}
                                            </TableCell>
                                            <TableCell style={{ width: 160 }} align="left">
                                                <div className='cursorPointer text-sky-500 font-sm' onClick={() => {
                                                    router.push(`/${row.seller}`)
                                                }}>
                                                    {row.seller.slice(0, 10)}...
                                                </div>
                                            </TableCell>
                                            <TableCell style={{ width: 160 }} align="right">
                                                {row.seller === address ? (
                                                    <div className="btn btn-info btn-sm text-white" onClick={async () => {
                                                        await handleCancelList(getMainData, row.sellId, nftData)
                                                        setTimeout(() => {
                                                            getMainData();
                                                        }, 3000)
                                                    }}>Cancel</div>
                                                ) : nftData.ownerAddress !== address && (
                                                    <div
                                                        className="btn btn-info btn-sm text-white"
                                                        onClick={() => handleBuyListToken(
                                                            row.sellId,
                                                            row.amount,
                                                            row.price,
                                                            row.seller,
                                                            nftData,
                                                            availableUsers,
                                                            getMainData
                                                        )}
                                                    >
                                                        Purchase
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 53 * emptyRows }}>
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                            colSpan={4}
                                            count={totalListings.length}
                                            rowsPerPage={limit}
                                            page={page}
                                            SelectProps={{
                                                inputProps: {
                                                    'aria-label': 'rows per page',
                                                },
                                                native: true,
                                            }}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            ActionsComponent={TablePaginationActions}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Stack alignItems='center' justifyContent='center' className='w-full'>
                            <Player
                                autoplay
                                loop
                                src="/assets/lottie/empty.json"
                                style={{ height: '160px', width: '160px' }}
                            />
                            No listings yet
                        </Stack>
                    )}
                </div>
            </div>
        </div >
    )
}
