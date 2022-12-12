

const Matrix = function<T>(width: number, height: number, fill: T): Matrix<T> {
	const array = new Array<Array<T>>()

	while(height--)
		array.push(new Array<T>(width).fill(fill));

	return array
}

Matrix.copy = function<T>(matrix: Matrix<T>) {
	const result: Matrix<T> = []
	
	matrix.forEach((item: Array<T>) => {
		result.push(item.slice())
	});

	return result
}

Matrix.toObject = function<T>(matrix: Matrix<T>) {
	const obj = {}

	matrix.forEach((row, y) => {
		obj[y] = new Array(row.length)
		row.forEach((val, x) => {
			obj[y][x] = val
		})
	})

	return obj
}
export default Matrix;

declare global {
	// Type accessable anywhere
	type Matrix<T> = Array<Array<T>>	
}