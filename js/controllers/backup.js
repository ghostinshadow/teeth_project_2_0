$scope.iterateOverArray = function(arr, result) {
    angular.forEach(arr, function(elm) {
        var arr_len = elm.teeth_nums.length,
            i = 0;
        if (arr_len > 1) {
            for (i; i < arr_len; i++) {
                result.push(elm.teeth_nums[i]);
            }
        }
    })
    return result;
};

$scope.iterateOverArraySwitch = function(arr, result) {
    angular.forEach(arr, function(elm) {
        var arr_len = elm.teeth_nums.length,
            i = 0;
        if (arr_len > 1) {
            for (i; i < arr_len; i++) {
                if ($scope.complex_cond.indexOf(elm.teeth_nums[i]) == -1) {
                    result.push(elm.teeth_nums[i]);
                } else {
                    result = $scope.addOnCondition(elm.teeth_nums[i], result);
                }
            }
        }
    })
    return result;
}

$scope.addOnCondition = function(condition, result) {
    switch (condition) {
        case 'всі':
            result = $scope.iterateOverArray($scope.up_teeth_num.concat($scope.bottom_teeth_num), result)
            break;
        case 'мол_всі':
            result = $scope.iterateOverArray($scope.up_milk_num.concat($scope.bottom_milk_num), result)
            break;
        case 'в/щ':
            result = $scope.iterateOverArray($scope.up_teeth_num, result)
            break;
        case 'н/щ':
            result = $scope.iterateOverArray($scope.bottom_teeth_num, result)
            break;
        case 'мол_в/щ':
            result = $scope.iterateOverArray($scope.up_milk_num, result)
            break;
        case 'мол_н/щ':
            result = $scope.iterateOverArray($scope.bottom_milk_num, result)
            break;
    };
    return result
};
