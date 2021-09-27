
import { Symbol } from '../src/symbol.js'
import { Application } from '../src/application.js'
import { Binding } from '../src/binding.js'
import { Environment } from '../src/environment.js'
import { LogicConcept } from '../src/logic-concept.js'
import M from '../src/matching.js'

describe( 'Constraint', () => {

    it( 'Should declare the relevant global identifiers', () => {
        expect( M.metavariable ).to.be.ok
        expect( typeof M.metavariable ).to.equal( 'string' )
        expect( M.metavariable ).to.equal( M.Constraint.metavariable )
        expect( M.Constraint ).to.be.ok
    } )

    it( 'Should let us mark metavariables, and it can detect them', () => {
        // test with just symbols
        const A = new Symbol( 'A' )
        const B = new Symbol( 'β₁' )
        const C = new Symbol( 'C c see sea sí sim' )
        const D = new Symbol( 'd' )
        const E = new Symbol( '∃' )
        expect( A.isA( M.metavariable ) ).to.equal( false )
        expect( B.isA( M.metavariable ) ).to.equal( false )
        expect( C.isA( M.metavariable ) ).to.equal( false )
        expect( D.isA( M.metavariable ) ).to.equal( false )
        expect( E.isA( M.metavariable ) ).to.equal( false )
        B.makeIntoA( M.metavariable )
        D.makeIntoA( M.metavariable )
        expect( A.isA( M.metavariable ) ).to.equal( false )
        expect( B.isA( M.metavariable ) ).to.equal( true )
        expect( C.isA( M.metavariable ) ).to.equal( false )
        expect( D.isA( M.metavariable ) ).to.equal( true )
        expect( E.isA( M.metavariable ) ).to.equal( false )
        A.makeIntoA( M.metavariable )
        D.unmakeIntoA( M.metavariable )
        expect( A.isA( M.metavariable ) ).to.equal( true )
        expect( B.isA( M.metavariable ) ).to.equal( true )
        expect( C.isA( M.metavariable ) ).to.equal( false )
        expect( D.isA( M.metavariable ) ).to.equal( false )
        expect( E.isA( M.metavariable ) ).to.equal( false )
        // test compound expressions
        const big1 = new Application( A, B, C )
        const big2 = new Environment( C, D, E )
        const big3 = new LogicConcept( big1, big2 )
        expect( big1.isA( M.metavariable ) ).to.equal( false )
        expect( big2.isA( M.metavariable ) ).to.equal( false )
        expect( big3.isA( M.metavariable ) ).to.equal( false )
        expect( M.Constraint.containsAMetavariable( big1 ) ).to.equal( true )
        expect( M.Constraint.containsAMetavariable( big2 ) ).to.equal( false )
        expect( M.Constraint.containsAMetavariable( big3 ) ).to.equal( true )
    } )

    it( 'Should let us construct only well-formed Constraints', () => {
        // if there are no metavariables, everything is fine
        let P, E, C
        ;[ P, E ] = LogicConcept.fromPutdown( `
            (+ 1 2)
            (* n m)
        ` )
        expect( () => C = new M.Constraint( P, E ) ).not.to.throw()
        expect( C ).to.be.instanceOf( M.Constraint )
        // in here, we also test the getters for pattern and expression, briefly
        expect( C.pattern ).to.equal( P )
        expect( C.expression ).to.equal ( E )
        // if there are metavariables in the pattern only, everything is fine
        ;[ P, E ] = LogicConcept.fromPutdown( `
            (+ 1 (- K Q))
            (* n m)
        ` )
        expect( P.child( 2 ).child( 1 ).text() ).to.equal( 'K' )
        P.child( 2 ).child( 1 ).makeIntoA( M.metavariable )
        expect( P.child( 2 ).child( 2 ).text() ).to.equal( 'Q' )
        P.child( 2 ).child( 2 ).makeIntoA( M.metavariable )
        expect( () => C = new M.Constraint( P, E ) ).not.to.throw()
        expect( C ).to.be.instanceOf( M.Constraint )
        expect( C.pattern ).to.equal( P )
        expect( C.expression ).to.equal ( E )
        // if there are metavariables in both, errors should be thrown
        ;[ P, E ] = LogicConcept.fromPutdown( `
            (+ 1 (- K Q))
            (* n m)
        ` )
        expect( P.child( 2 ).child( 1 ).text() ).to.equal( 'K' )
        P.child( 2 ).child( 1 ).makeIntoA( M.metavariable )
        expect( P.child( 2 ).child( 2 ).text() ).to.equal( 'Q' )
        P.child( 2 ).child( 2 ).makeIntoA( M.metavariable )
        expect( E.child( 1 ).text() ).to.equal( 'n' )
        E.child( 1 ).makeIntoA( M.metavariable )
        expect( E.child( 2 ).text() ).to.equal( 'm' )
        E.child( 2 ).makeIntoA( M.metavariable )
        expect( () => C = new M.Constraint( P, E ) ).to.throw(
            'may not contain metavariables' )
        // if there are metavariables in the expression, errors should be thrown
        ;[ P, E ] = LogicConcept.fromPutdown( `
            (+ 1 (- K Q))
            (* n m)
        ` )
        expect( E.child( 1 ).text() ).to.equal( 'n' )
        E.child( 1 ).makeIntoA( M.metavariable )
        expect( E.child( 2 ).text() ).to.equal( 'm' )
        E.child( 2 ).makeIntoA( M.metavariable )
        expect( () => C = new M.Constraint( P, E ) ).to.throw(
            'may not contain metavariables' )
        // even just one metavariable is problematic in the expression
        E = new Symbol( 'oh well' ).asA( M.metavariable )
        expect( () => C = new M.Constraint( P, E ) ).to.throw(
            'may not contain metavariables' )
    } )

    it( 'Should support making shallow copies', () => {
        // Construct one of the constraints we made in the previous test
        let P, E, C
        ;[ P, E ] = LogicConcept.fromPutdown( `
            (+ 1 (- K Q))
            (* n m)
        ` )
        P.child( 2 ).child( 1 ).makeIntoA( M.metavariable )
        P.child( 2 ).child( 2 ).makeIntoA( M.metavariable )
        C = new M.Constraint( P, E )
        // make a copy and ensure it throws no errors
        let copy
        expect( () => copy = C.copy() ).not.to.throw()
        // ensure that it has the same pattern and expression as the original
        expect( C.pattern ).to.equal( copy.pattern )
        expect( C.expression ).to.equal( copy.expression )
        // and yet they are not the same object
        expect( C ).not.to.equal( copy )
    } )

    it( 'Should correctly compute equality for two instances', () => {
        // a constraint is equal to one that looks exactly the same
        expect( new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        ).equals( new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        ) ) ).to.equal( true )
        // two constraints are not equal if their patterns differ, even if just
        // by an attribute, such as whether one is a metavariable
        expect( new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        ).equals( new M.Constraint(
            new Symbol( 'X' ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        ) ) ).to.equal( false )
        // two constraints are not equal if their expressions differ
        expect( new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        ).equals( new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            new Symbol( 'y' )
        ) ) ).to.equal( false )
        // two constraints are not equal if both pattern and expression differ
        expect( new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        ).equals( new M.Constraint(
            new Symbol( 'X' ),
            new Symbol( 'y' )
        ) ) ).to.equal( false )
        // a constraint is equal to a copy of itself
        let C = new M.Constraint(
            new Symbol( 'X' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(sqrt (+ (^ x 2) (^ y 2)))' )[0]
        )
        expect( C.equals( C.copy() ) ).to.equal( true )
    } )

    it( 'Should reliably test whether it can be applied', () => {
        let C
        // a Constraint whose pattern is a single metavariable can be applied
        C = new M.Constraint(
            new Symbol( 'example' ).asA( M.metavariable ),
            LogicConcept.fromPutdown( '(x y z a b c)' )[0]
        )
        expect( C.canBeApplied() ).to.equal( true )
        // a Constraint whose pattern is a single symbol cannot be applied,
        // if we don't mark that symbol as a metavariable
        C = new M.Constraint(
            new Symbol( 'example' ),
            LogicConcept.fromPutdown( '(x y z a b c)' )[0]
        )
        expect( C.canBeApplied() ).to.equal( false )
        // a Constraint whose pattern is anything other than a symbol cannot be
        // applied, even if we (erroneously) mark that pattern as a metavariable
        C = new M.Constraint(
            LogicConcept.fromPutdown( '(1 2 3)' )[0].asA( M.metavariable ),
            LogicConcept.fromPutdown( '(x y z a b c)' )[0]
        )
        expect( C.canBeApplied() ).to.equal( false )
        C = new M.Constraint(
            LogicConcept.fromPutdown( '[pi const]' )[0].asA( M.metavariable ),
            LogicConcept.fromPutdown( '(x y z a b c)' )[0]
        )
        expect( C.canBeApplied() ).to.equal( false )
        C = new M.Constraint(
            LogicConcept.fromPutdown( '{ { } }' )[0].asA( M.metavariable ),
            LogicConcept.fromPutdown( '(x y z a b c)' )[0]
        )
        expect( C.canBeApplied() ).to.equal( false )
    } )

    it( 'Should apply itself correctly in-place or functionally', () => {
        // create a Constraint that can be applied
        let X = new Symbol( 'X' ).asA( M.metavariable )
        let C = new M.Constraint(
            X.copy(),
            LogicConcept.fromPutdown( '(exp (- x))' )[0]
        )
        // create three patterns to which to apply it, and copies of each
        let P1 = new Application( new Symbol( 'f' ), X.copy() )
        let P2 = new Binding( new Symbol( '𝝺' ), new Symbol( 'v' ),
            new Application( X.copy(), new Symbol( 'v' ) ) )
        let P3 = new Environment( X.copy(), X.copy(), X.copy() )
        const P1copy = P1.copy()
        const P2copy = P2.copy()
        const P3copy = P3.copy()
        expect( P1.equals( P1copy ) ).to.equal( true )
        expect( P2.equals( P2copy ) ).to.equal( true )
        expect( P3.equals( P3copy ) ).to.equal( true )
        // create expected results after applying the constraint
        const newP1 = LogicConcept.fromPutdown( '(f (exp (- x)))' )[0]
        const newP2 = LogicConcept.fromPutdown( '(𝝺 v , ((exp (- x)) v))' )[0]
        const newP3 = LogicConcept.fromPutdown(
            '{ (exp (- x)) (exp (- x)) (exp (- x)) }' )[0]
        // apply C to P1 in place and ensure the result is as expected
        // and P1 is no longer equal to P1copy
        expect( () => C.applyTo( P1 ) ).not.to.throw()
        expect( P1.equals( P1copy ) ).to.equal( false )
        expect( P1.equals( newP1 ) ).to.equal( true )
        // repeat same experiment for P2 and P2copy
        expect( () => C.applyTo( P2 ) ).not.to.throw()
        expect( P2.equals( P2copy ) ).to.equal( false )
        expect( P2.equals( newP2 ) ).to.equal( true )
        // repeat same experiment for P3 and P3copy
        expect( () => C.applyTo( P3 ) ).not.to.throw()
        expect( P3.equals( P3copy ) ).to.equal( false )
        expect( P3.equals( newP3 ) ).to.equal( true )
        // make new targets from the backup copies we saved of P1,P2,P3
        let P1_2 = P1copy.copy()
        let P2_2 = P2copy.copy()
        let P3_2 = P3copy.copy()
        // apply C functionally (not in place) to those three, saving the
        // results as new expressions, then ensure that no change took place
        // in any of those originals
        const applied1 = C.appliedTo( P1_2 )
        const applied2 = C.appliedTo( P2_2 )
        const applied3 = C.appliedTo( P3_2 )
        expect( P1copy.equals( P1_2 ) ).to.equal( true )
        expect( P2copy.equals( P2_2 ) ).to.equal( true )
        expect( P3copy.equals( P3_2 ) ).to.equal( true )
        // then ensure that the results computed this way are the same as the
        // results computed with the in-place applyTo(), which were verified
        // above to be correct
        expect( applied1.equals( P1 ) ).to.equal( true )
        expect( applied2.equals( P2 ) ).to.equal( true )
        expect( applied3.equals( P3 ) ).to.equal( true )
        // ensure that Constraints cannot be applied in-place to other
        // Constraints
        let badTarget = new M.Constraint( P1.copy(),
            LogicConcept.fromPutdown( '(hello there "friend")' )[0] )
        expect( () => C.applyTo( badTarget ) ).to.throw(
            /^Cannot apply a constraint to that/ )
        // but it is okay to apply not-in-place to a Constraint, thus creating
        // a new, altered copy
        let substituted
        expect( () => substituted = C.appliedTo( badTarget ) ).not.to.throw()
        expect( substituted.pattern.equals( C.appliedTo( P1.copy() ) ) )
            .to.equal( true )
        expect( substituted.expression.equals( badTarget.expression ) )
            .to.equal( true )
        // ensure that Constraints can be applied to Problems in-place
        let prob = new M.Problem()
        const E1 = LogicConcept.fromPutdown( '(an appli cation)' )[0]
        const E2 = LogicConcept.fromPutdown( '(a bin , ding)' )[0]
        prob.add( P1copy, E1, P2copy, E2 )
        expect( prob.constraints.length ).to.equal( 2 )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( P1copy ) && constraint.expression.equals( E1 )
        ) ).to.equal( true )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( P2copy ) && constraint.expression.equals( E2 )
        ) ).to.equal( true )
        expect( () => C.applyTo( prob ) ).not.to.throw()
        expect( prob.constraints.length ).to.equal( 2 )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( newP1 ) && constraint.expression.equals( E1 )
        ) ).to.equal( true )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( newP2 ) && constraint.expression.equals( E2 )
        ) ).to.equal( true )
        // ensure that Constraints can be applied to Problems to make copies
        prob = new M.Problem()
        prob.add( P1copy, E1, P2copy, E2 )
        expect( prob.constraints.length ).to.equal( 2 )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( P1copy ) && constraint.expression.equals( E1 )
        ) ).to.equal( true )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( P2copy ) && constraint.expression.equals( E2 )
        ) ).to.equal( true )
        let probNew
        expect( () => probNew = C.appliedTo( prob ) ).not.to.throw()
        expect( prob.constraints.length ).to.equal( 2 )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( P1copy ) && constraint.expression.equals( E1 )
        ) ).to.equal( true )
        expect( prob.constraints.some( constraint =>
            constraint.pattern.equals( P2copy ) && constraint.expression.equals( E2 )
        ) ).to.equal( true )
        expect( probNew.constraints.length ).to.equal( 2 )
        expect( probNew.constraints.some( constraint =>
            constraint.pattern.equals( newP1 ) && constraint.expression.equals( E1 )
        ) ).to.equal( true )
        expect( probNew.constraints.some( constraint =>
            constraint.pattern.equals( newP2 ) && constraint.expression.equals( E2 )
        ) ).to.equal( true )
    } )

    it( 'Should correctly compute complexity levels and names', () => {
        let P, E, C
        // Two different non-patterns = failure
        P = LogicConcept.fromPutdown( 'a' )[0]
        E = LogicConcept.fromPutdown( '(b c)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 0 )
        expect( C.complexityName() ).to.equal( 'failure' )
        // Application and non-application = failure
        P = LogicConcept.fromPutdown( '(x y z)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b , c)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 0 )
        expect( C.complexityName() ).to.equal( 'failure' )
        // Binding and non-binding = failure
        P = LogicConcept.fromPutdown( '(x y , z)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b c)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 0 )
        expect( C.complexityName() ).to.equal( 'failure' )
        // Applications with different sizes = failure
        P = LogicConcept.fromPutdown( '(x y z)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 0 )
        expect( C.complexityName() ).to.equal( 'failure' )
        // Bindings with different sizes = failure
        P = LogicConcept.fromPutdown( '(x y z , w)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b , c)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 0 )
        expect( C.complexityName() ).to.equal( 'failure' )
        // Two different non-patterns = success
        P = LogicConcept.fromPutdown( '(x (w w) z)' )[0]
        E = LogicConcept.fromPutdown( '(x (w w) z)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 1 )
        expect( C.complexityName() ).to.equal( 'success' )
        // Metavariable pattern = instantiation
        P = new Symbol( 'A' ).asA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 2 )
        expect( C.complexityName() ).to.equal( 'instantiation' )
        // Applications with same sizes = children
        P = LogicConcept.fromPutdown( '(x y z)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b c)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 3 )
        expect( C.complexityName() ).to.equal( 'children' )
        // Bindings with same sizes = children
        P = LogicConcept.fromPutdown( '(x y z , w)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b c , d)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 3 )
        expect( C.complexityName() ).to.equal( 'children' )
        // Exprssion Function Application pattern = EFA
        P = M.newEFA( new Symbol( 'P' ).asA( M.metavariable ), new Symbol( 'x' ) )
        E = LogicConcept.fromPutdown( '(a b c d)' )[0]
        C = new M.Constraint( P, E )
        expect( C.complexity() ).to.equal( 4 )
        expect( C.complexityName() ).to.equal( 'EFA' )
    } )

    it( 'Should correctly compute arrays of child constraints', () => {
        let P, E, C
        // First, it should throw an error if you try to compute child
        // constraints for the wrong type of constraints.
        P = LogicConcept.fromPutdown( 'a' )[0]
        E = LogicConcept.fromPutdown( '(b c)' )[0]
        C = new M.Constraint( P, E )
        expect( () => C.children() ).to.throw( /^Cannot compute.*this type/ )
        P = M.newEFA( new Symbol( 'P' ).asA( M.metavariable ), new Symbol( 'x' ) )
        E = LogicConcept.fromPutdown( '(a b c d)' )[0]
        C = new M.Constraint( P, E )
        expect( () => C.children() ).to.throw( /^Cannot compute.*this type/ )
        // Next, consider two applications of the same size
        P = LogicConcept.fromPutdown( '(x y z)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b c)' )[0]
        C = new M.Constraint( P, E )
        let result
        expect( () => result = C.children() ).not.to.throw()
        expect( result.length ).to.equal( 3 )
        expect( result[0] ).to.be.instanceOf( M.Constraint )
        expect( result[0].pattern.equals( new Symbol( 'x' ) ) ).to.equal( true )
        expect( result[0].expression.equals( new Symbol( 'a' ) ) ).to.equal( true )
        expect( result[1] ).to.be.instanceOf( M.Constraint )
        expect( result[1].pattern.equals( new Symbol( 'y' ).asA( M.metavariable ) ) )
            .to.equal( true )
        expect( result[1].expression.equals( new Symbol( 'b' ) ) ).to.equal( true )
        expect( result[2] ).to.be.instanceOf( M.Constraint )
        expect( result[2].pattern.equals( new Symbol( 'z' ) ) ).to.equal( true )
        expect( result[2].expression.equals( new Symbol( 'c' ) ) ).to.equal( true )
        // Last, consider two bindings of the same size
        P = LogicConcept.fromPutdown( '(x y z , w)' )[0]
        P.child( 1 ).makeIntoA( M.metavariable )
        E = LogicConcept.fromPutdown( '(a b c , d)' )[0]
        C = new M.Constraint( P, E )
        expect( () => result = C.children() ).not.to.throw()
        expect( result.length ).to.equal( 4 )
        expect( result[0] ).to.be.instanceOf( M.Constraint )
        expect( result[0].pattern.equals( new Symbol( 'x' ) ) ).to.equal( true )
        expect( result[0].expression.equals( new Symbol( 'a' ) ) ).to.equal( true )
        expect( result[1] ).to.be.instanceOf( M.Constraint )
        expect( result[1].pattern.equals( new Symbol( 'y' ).asA( M.metavariable ) ) )
            .to.equal( true )
        expect( result[1].expression.equals( new Symbol( 'b' ) ) ).to.equal( true )
        expect( result[2] ).to.be.instanceOf( M.Constraint )
        expect( result[2].pattern.equals( new Symbol( 'z' ) ) ).to.equal( true )
        expect( result[2].expression.equals( new Symbol( 'c' ) ) ).to.equal( true )
        expect( result[3] ).to.be.instanceOf( M.Constraint )
        expect( result[3].pattern.equals( new Symbol( 'w' ) ) ).to.equal( true )
        expect( result[3].expression.equals( new Symbol( 'd' ) ) ).to.equal( true )
    } )

} )
